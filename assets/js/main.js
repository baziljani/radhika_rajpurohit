const products = [
    {
        id: 1,
        name: "Banarasi Silk Saree",
        price: 5999,
        originalPrice: 8999,
        image: "/assets/images/product/product1.jpeg",
        link: "/product/?id=1",
        category: "women",
        badge: "Best Seller",
        colors: ["Red", "Blue", "Green"],
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        name: "Designer Lehenga",
        price: 12999,
        originalPrice: 15999,
        image: "/assets/images/product/product2.webp",
        link: "/product/?id=2",
        category: "women",
        badge: "New Arrival",
        colors: ["Pink", "Gold", "Maroon"],
        sizes: ["S", "M", "L"]
    },
    {
        id: 3,
        name: "Men's Silk Kurta",
        price: 3999,
        originalPrice: 5999,
        image: "/assets/images/product/product3.jpg",
        link: "/product/?id=3",
        category: "men",
        badge: "Trending",
        colors: ["White", "Black", "Blue"],
        sizes: ["M", "L", "XL"]
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderProducts() {
    const grids = document.querySelectorAll('.product-grid');
    if (!grids.length) return;

    grids.forEach(grid => {
        const category = grid.dataset.category;
        const filteredProducts = category 
            ? products.filter(p => p.category === category) 
            : products;

        grid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <a href="${product.link}" class="product-image-link">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="quick-view">QUICK VIEW</div>
                </a>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <div class="price-container">
                        <span class="price">₹${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="color-options">
                        ${product.colors.map(color => `
                            <span class="color-dot" style="background-color: ${color.toLowerCase()}" title="${color}"></span>
                        `).join('')}
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="buy-now">
                            <i class="fas fa-bolt"></i> Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        el.classList.toggle('has-items', count > 0);
    });
}

function addToCart(productCard) {
    const productId = parseInt(productCard.dataset.id);
    const product = products.find(p => p.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            title: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1,
            selectedColor: product.colors[0],
            selectedSize: product.sizes[0]
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    const cartBtn = document.querySelector('.cart-icon');
    if (cartBtn) {
        cartBtn.classList.add('animate-bounce');
        setTimeout(() => cartBtn.classList.remove('animate-bounce'), 1000);
    }

    showToast(`${product.name} added to cart!`);
}

function buyNow(productCard) {
    const productId = parseInt(productCard.dataset.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const tempCart = [{
        ...product,
        quantity: 1,
        selectedColor: product.colors[0],
        selectedSize: product.sizes[0]
    }];

    localStorage.setItem('checkoutCart', JSON.stringify(tempCart));
    window.location.href = '/checkout/checkout.html?buyNow=true';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

function handleProductActions(e) {
    const productCard = e.target.closest('.product-card');
    if (!productCard) return;

    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        e.preventDefault();
        addToCart(productCard);
    } else if (e.target.classList.contains('buy-now') || e.target.closest('.buy-now')) {
        e.preventDefault();
        buyNow(productCard);
    }
}

function setupCarousel() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentIndex = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let autoPlayInterval;

    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    updateCarousel();

    carousel.addEventListener('touchstart', touchStart);
    carousel.addEventListener('touchend', touchEnd);
    carousel.addEventListener('touchmove', touchMove);
    carousel.addEventListener('mousedown', touchStart);
    carousel.addEventListener('mouseup', touchEnd);
    carousel.addEventListener('mouseleave', touchEnd);
    carousel.addEventListener('mousemove', touchMove);

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    function startAutoPlay() {
        autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;
        updateCarousel();
    }

    function updateCarousel() {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });
        
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function touchStart(e) {
        if (e.type === 'touchstart') {
            startPos = e.touches[0].clientX;
        } else {
            startPos = e.clientX;
            e.preventDefault();
        }
        
        isDragging = true;
        stopAutoPlay();
        animationID = requestAnimationFrame(animation);
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -100 && currentIndex < slides.length - 1) {
            currentIndex += 1;
        }
        
        if (movedBy > 100 && currentIndex > 0) {
            currentIndex -= 1;
        }
        
        updateCarousel();
        startAutoPlay();
    }

    function touchMove(e) {
        if (!isDragging) return;
        const currentPosition = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        currentTranslate = prevTranslate + currentPosition - startPos;
    }

    function animation() {
        animationID = requestAnimationFrame(animation);
    }
}

const mainImage = document.getElementById('mainImage');
mainImage.addEventListener('mousemove', (e) => {
    const rect = mainImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mainImage.style.transformOrigin = `${x}px ${y}px`;
    mainImage.style.transform = 'scale(1.5)';
});

mainImage.addEventListener('mouseleave', () => {
    mainImage.style.transform = 'scale(1)';
    mainImage.style.transformOrigin = 'center';
});

const thumbnails = document.querySelectorAll('.thumbnail');
thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => {
        mainImage.src = thumbnail.src;
    });
});

const addToCartButton = document.querySelector('.add-to-cart');
addToCartButton.addEventListener('click', () => {
    const product = {
        name: document.querySelector('.product-details h1').textContent,
        price: document.querySelector('.product-details .price').textContent,
        quantity: document.getElementById('quantity').value,
        color: document.getElementById('color').value,
        size: document.getElementById('size').value,
        image: document.getElementById('mainImage').src
    };

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = '/cart/cart.html';
});

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    setupCarousel();
    document.addEventListener('click', handleProductActions);
});