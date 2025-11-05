from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Address

class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    
    # --- FIX 1: ADD THIS ---
    # This creates a full URL for the profile picture
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        
        # --- FIX 2: UPDATE THE 'fields' LIST ---
        # We replace 'profile_picture' with 'profile_picture_url'
        # and add 'is_staff' so the homepage knows if you are an admin.
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'date_of_birth', 'profile_picture_url', 
                  'is_verified', 'created_at', 'is_staff']
        read_only_fields = ['id', 'is_verified', 'created_at', 'is_staff']

    # --- FIX 3: ADD THIS METHOD ---
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
        return None # Return null if no picture

class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            
            # --- FIX 4: THIS WHOLE BLOCK IS NEW ---
            # Try to authenticate using the email as the username
            # This works if the user's USERNAME_FIELD is 'email'
            user = authenticate(username=email, password=password)

            if not user:
                # If that fails, find the user by email
                # and try to authenticate with their *actual* username.
                try:
                    user_by_email = User.objects.get(email=email)
                    user = authenticate(username=user_by_email.username, password=password)
                except User.DoesNotExist:
                    user = None # Will fail the check below

            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

class AddressSerializer(serializers.ModelSerializer):
    """Address serializer"""
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'street_address', 'apartment', 
                  'city', 'state', 'postal_code', 'country', 'is_default', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs