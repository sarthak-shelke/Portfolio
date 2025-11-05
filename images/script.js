const products = [
  { name: "DRILL_MACHINE", price: "$399.99", image: "images/017-tapping-tool-pistol-type-250x250.webp" },
  { name: "HAMMER", price: "$29.99", image: "images/colour-coating-blind-rivets-250x250.webp" },
  { name: "PLIER", price: "$19.99", image: "images/half-hexagonal-rivetnut-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/hydraulic-power-pack-riveting-tool-electrical--250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/m-6-rivet-stud-250x250.webp" },
  
  { name: "SCREW DRIVER", price: "$129.99", image: "images/nutsert-tool-pneumatic-pistol-type-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/new-product-250x250 (2).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/new-product-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/om-3-riveting-tool-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/pneumatic-pop-rivet-gun-with-counter-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/pneumatic-screwdriver-pistol-250x250.webp" },
  { name: "SCREW DRIVER", price: "$12999", image: "images/pneumatic-screwdrivers-250x250.webp" },

  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250 (2).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250 (3).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250 (5).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250 (6).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250 (7).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250 (4).webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/product-jpeg-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/rivet-nut-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/rivets-nut-250x250.webp" },
  { name: "SCREW DRIVER", price: "$12999", image: "images/stus-installation-tool-om-10-250x250.webp" },
  { name: "SCREW DRIVER", price: "$129.99", image: "images/whatsapp-image-2022-12-21-at-11-34-06-am-250x250.webp" },
];

const productGrid = document.getElementById("productGrid");
const sortSelect = document.getElementById('sortSelect');
const sortBtn = document.getElementById('sortBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchClear = document.getElementById('searchClear');
const searchSuggestions = document.getElementById('searchSuggestions');
const cartTotalDisplay = document.getElementById("cartTotal");
const cartPopup = document.getElementById("cartPopup");
const cartItemsList = document.getElementById("cartItems");
const cartPopupTotal = document.getElementById("cartPopupTotal");
const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");

// Load cart from localStorage if available
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch { cart = []; }

function updateCartUI() {
  let total = 0;
  cartItemsList.innerHTML = "";

  cart.forEach((item, index) => {
    const price = parseFloat(item.price.replace('$', '').replace('₹', ''));
    total += price;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ₹${parseFloat(item.price.replace('$', '').replace('₹', '')).toFixed(2)}
      <button class="remove-item" data-index="${index}">Remove</button>
    `;
    cartItemsList.appendChild(li);
  });

  cartTotalDisplay.textContent = total.toFixed(2);
  cartPopupTotal.textContent = total.toFixed(2);

  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.getAttribute("data-index"));
      cart.splice(index, 1);
      updateCartUI();
    });
  });
}

let currentProducts = [...products];
let searchResults = [];
let isSearchMode = false;

function renderProducts(list) {
  productGrid.innerHTML = "";
  list.forEach((product, idx) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.index = String(idx);
    card.innerHTML = `
      <div class="product-row">
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="price">₹${parseFloat(product.price.replace('$', '')).toFixed(2)}</p>
          <div class="cta-row">
            <button class="add-to-cart get-best">Get Best Prices</button>
            <button class="view-details">View Details</button>
          </div>
        </div>
      </div>
    `;
    // Open product detail modal on card click (except button) with a quick pop animation
    card.addEventListener("click", (e) => {
      if (!(e.target instanceof Element)) return;
      // View details explicit button
      if (e.target.closest('.view-details')) {
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('card-pop');
        setTimeout(() => card.classList.remove('card-pop'), 250);
        openProductModal(product);
        return;
      }
      // Do NOT open modal when clicking on the image area
      if (e.target.closest('.product-image-wrap')) {
        return;
      }
      // If clicked outside CTAs, open details
      if (!e.target.closest('.add-to-cart') && !e.target.closest('.view-details')) {
        card.classList.add('card-pop');
        setTimeout(() => card.classList.remove('card-pop'), 250);
        openProductModal(product);
      }
    });
    productGrid.appendChild(card);
  });

  // re-apply reveal on scroll for new cards
  try {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    document.querySelectorAll('.product-card').forEach(card => {
      card.classList.add('reveal');
      observer.observe(card);
    });
  } catch {}
}

renderProducts(currentProducts);

function sortProducts(mode) {
  const toNumber = (p) => parseFloat(p.price.replace('$','').replace('₹','')) || 0;
  const byName = (a,b) => (a.name || '').localeCompare(b.name || '');
  const byPriceAsc = (a,b) => toNumber(a) - toNumber(b);
  const byPriceDesc = (a,b) => toNumber(b) - toNumber(a);
  let next = [...currentProducts];
  switch(mode) {
    case 'priceAsc': next.sort(byPriceAsc); break;
    case 'priceDesc': next.sort(byPriceDesc); break;
    case 'nameAsc': next.sort(byName); break;
    case 'nameDesc': next.sort((a,b)=>byName(b,a)); break;
    default: next = [...products];
  }
  currentProducts = next;
  renderProducts(currentProducts);
}

if (sortBtn && sortSelect) {
  sortBtn.addEventListener('click', () => sortProducts(sortSelect.value));
}

// Search functionality
function searchProducts(query) {
  if (!query || query.trim().length === 0) {
    isSearchMode = false;
    currentProducts = [...products];
    renderProducts(currentProducts);
    searchSuggestions.classList.remove('show');
    return;
  }

  const searchTerm = query.toLowerCase().trim();
  searchResults = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm)
  );

  if (searchResults.length > 0) {
    isSearchMode = true;
    currentProducts = searchResults;
    renderProducts(currentProducts);
  } else {
    productGrid.innerHTML = '<div class="no-results">No products found matching your search.</div>';
  }

  // Show suggestions
  showSearchSuggestions(searchResults.slice(0, 5));
}

function showSearchSuggestions(results) {
  searchSuggestions.innerHTML = '';
  if (results.length === 0) {
    searchSuggestions.classList.remove('show');
    return;
  }

  results.forEach((product, index) => {
    const item = document.createElement('div');
    item.className = 'search-suggestion-item';
    item.innerHTML = `
      <span style="flex:1;">${product.name}</span>
      <span style="color: #666; font-size: 12px;">₹${parseFloat(product.price.replace('$', '')).toFixed(2)}</span>
    `;
    item.addEventListener('click', () => {
      searchInput.value = product.name;
      searchProducts(product.name);
      searchSuggestions.classList.remove('show');
      // Open product detail modal
      openProductModal(product);
    });
    searchSuggestions.appendChild(item);
  });

  searchSuggestions.classList.add('show');
}

// Search event handlers
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const wrap = searchInput.parentElement;
    if (wrap && wrap.classList) {
      if (query && query.length > 0) wrap.classList.add('has-value'); else wrap.classList.remove('has-value');
    }
    if (query.length > 0) {
      searchProducts(query);
    } else {
      isSearchMode = false;
      currentProducts = [...products];
      renderProducts(currentProducts);
      searchSuggestions.classList.remove('show');
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = e.target.value.trim();
      if (query.length > 0) {
        searchProducts(query);
        searchSuggestions.classList.remove('show');
        // If only one result, open its detail page
        if (searchResults.length === 1) {
          openProductModal(searchResults[0]);
        }
      }
    }
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      searchProducts(query);
      searchSuggestions.classList.remove('show');
      // If only one result, open its detail page
      if (searchResults.length === 1) {
        openProductModal(searchResults[0]);
      }
    }
  });
}

if (searchClear) {
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    isSearchMode = false;
    currentProducts = [...products];
    renderProducts(currentProducts);
    searchSuggestions.classList.remove('show');
    searchInput.focus();
    const wrap = searchInput.parentElement; if (wrap && wrap.classList) wrap.classList.remove('has-value');
  });
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
    searchSuggestions.classList.remove('show');
  }
});

// Delegated handler on productGrid for Add to Cart
productGrid.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  const btn = target.closest('.add-to-cart');
  if (!btn) return;
  const card = btn.closest('.product-card');
  if (!card) return;
  const indexStr = card.getAttribute('data-index');
  const index = indexStr ? parseInt(indexStr, 10) : NaN;
  const list = currentProducts && currentProducts.length ? currentProducts : products;
  if (Number.isNaN(index) || !list[index]) return;
  e.preventDefault();
  e.stopPropagation();
  cart.push(list[index]);
  updateCartUI();
  if (cartButton) {
    cartButton.classList.add('cart-pop');
    setTimeout(() => cartButton.classList.remove('cart-pop'), 400);
  }
});

cartButton.addEventListener("click", () => {
  cartPopup.classList.toggle("hidden");
});

closeCart.addEventListener("click", () => {
  cartPopup.classList.add("hidden");
});
// ===== Slideshow (Image Carousel) =====
// Build slider from online images
const slider = document.getElementById('slider');
const sliderImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=300&q=80',
  'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&h=300&q=80',
  'https://images.unsplash.com/photo-1516382799247-87f1f0f6d79f?auto=format&fit=crop&w=1200&h=300&q=80',
  'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=1200&h=300&q=80',
  'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&h=300&q=80'
];

sliderImages.forEach(src => {
  const img = document.createElement('img');
  img.src = src;
  slider.appendChild(img);
});

let currentSlide = 0;
const totalSlides = sliderImages.length;

function showNextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

setInterval(showNextSlide, 4000);

// image gallery below slideshow removed

function toggleMenu() {
    const menu = document.getElementById('menu-items');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Optional: Close menu when clicking outside
window.addEventListener('click', function(e) {
    const menu = document.getElementById('menu-items');
    const dots = document.querySelector('.dots-menu');
    if (!menu.contains(e.target) && !dots.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Menu popup logic
const menuContainer = document.querySelector('.menu-container');
const dotsMenu = document.querySelector('.dots-menu');
const menuItems = document.getElementById('menu-items');

dotsMenu.addEventListener('click', function(event) {
  event.stopPropagation();
  menuContainer.classList.toggle('open');
});

document.addEventListener('click', function(event) {
  if (!menuContainer.contains(event.target)) {
    menuContainer.classList.remove('open');
  }
});

// Product Modal Logic
function openProductModal(product) {
  const modal = document.getElementById('productModal');
  const modalImg = document.getElementById('productModalImage');
  const modalTitle = document.getElementById('productModalTitle');
  const modalPrice = document.getElementById('productModalPrice');
  const modalAdd = document.getElementById('productModalAdd');
  const backdrop = document.getElementById('productModalBackdrop');
  const closeBtn = document.getElementById('productModalClose');

  if (!modal || !modalImg || !modalTitle || !modalPrice || !modalAdd) return;

  modalImg.src = product.image;
  modalTitle.textContent = product.name;
  modalPrice.textContent = `₹${parseFloat(product.price.replace('$', '')).toFixed(2)}`;

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  const handleClose = () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    backdrop?.removeEventListener('click', handleClose);
    closeBtn?.removeEventListener('click', handleClose);
    document.removeEventListener('keydown', escHandler);
  };

  const escHandler = (e) => { if (e.key === 'Escape') handleClose(); };

  backdrop?.addEventListener('click', handleClose);
  closeBtn?.addEventListener('click', handleClose);
  // Fallback: ensure clicks on the X always close, even if bubbling is stopped
  closeBtn?.addEventListener('mousedown', (e) => { e.stopPropagation(); });
  closeBtn?.addEventListener('mouseup', (e) => { e.stopPropagation(); handleClose(); });
  document.addEventListener('keydown', escHandler);

  // Wire Add to Cart in modal
  modalAdd.onclick = () => {
    cart.push(product);
    updateCartUI();
    handleClose();
    cartButton.classList.add('cart-pop');
    setTimeout(() => cartButton.classList.remove('cart-pop'), 400);
  };
}

// Futuristic login overlay logic
window.addEventListener('DOMContentLoaded', function() {
  // Intro overlay logic (show once per session)
  try {
    const introOverlay = document.getElementById('introOverlay');
    const enterBtn = document.getElementById('enterSiteBtn');
    const params = new URLSearchParams(location.search);
    const forceIntro = params.get('intro') === '1';
    const hasSeenIntro = !forceIntro && localStorage.getItem('introSeen') === '1';
    const slidesContainer = document.getElementById('introSlides');
    const slideImages = [
      'https://images.unsplash.com/photo-1516382799247-87f1f0f6d79f?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1600&q=80'
    ];
    let slideIndex = 0;
    let slideTimer = null;

    if (introOverlay && enterBtn) {
      if (!hasSeenIntro) {
        introOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';

        // build slides
        if (slidesContainer) {
          slideImages.forEach((src, i) => {
            const div = document.createElement('div');
            div.className = 'intro-slide' + (i === 0 ? ' active' : '');
            div.style.backgroundImage = `url(${src})`;
            slidesContainer.appendChild(div);
          });

          const slides = () => Array.from(slidesContainer.children);
          const showNext = () => {
            const list = slides();
            if (list.length === 0) return;
            list[slideIndex].classList.remove('active');
            slideIndex = (slideIndex + 1) % list.length;
            list[slideIndex].classList.add('active');
          };
          slideTimer = setInterval(showNext, 5000);
        }
      } else {
        introOverlay.remove();
      }

      enterBtn.addEventListener('click', function() {
        // Only persist once when not forcing intro via URL
        if (!forceIntro) {
          localStorage.setItem('introSeen', '1');
        }
        if (slideTimer) clearInterval(slideTimer);
        introOverlay.style.opacity = '0';
        introOverlay.style.visibility = 'hidden';
        setTimeout(() => {
          introOverlay.remove();
          document.body.style.overflow = '';
        }, 500);
      });
    }
  } catch (e) { /* no-op */ }

  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');

  // Do NOT auto-open on page load
  loginOverlay.style.display = 'none';
  loginOverlay.style.opacity = '1';

  // Open via Sign Up button
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      loginOverlay.style.display = 'flex';
      loginOverlay.style.opacity = '1';
      document.body.style.overflow = 'hidden';
    });
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    if (user && pass) {
      loginOverlay.style.opacity = '0';
      setTimeout(() => {
        loginOverlay.style.display = 'none';
        document.body.style.overflow = '';
        loginOverlay.style.opacity = '1';
      }, 500);
    } else {
      loginForm.classList.add('shake');
      setTimeout(() => loginForm.classList.remove('shake'), 400);
    }
  });

  const skipBtn = document.querySelector('.login-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', function() {
      loginOverlay.style.opacity = '0';
      setTimeout(() => {
        loginOverlay.style.display = 'none';
        document.body.style.overflow = '';
        loginOverlay.style.opacity = '1';
      }, 500);
    });
  }
});

// Initialize cart UI on page load
updateCartUI();

// Reveal on scroll for product cards
try {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.add('reveal');
    observer.observe(card);
  });
} catch {}

// Ensure close button always closes the product modal (global safety net)
try {
  const modalEl = document.getElementById('productModal');
  const modalCloseEl = document.getElementById('productModalClose');
  if (modalEl && modalCloseEl) {
    modalCloseEl.addEventListener('click', () => {
      modalEl.classList.remove('show');
      document.body.style.overflow = '';
    });
  }
} catch {}
