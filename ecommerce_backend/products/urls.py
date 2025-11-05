from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.products_list, name='products_list'),
    path('categories/', api_views.categories_list, name='categories_list'),
    path('featured/', api_views.featured_products, name='featured_products'),
]