document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const totalElement = document.getElementById('total');
    const checkoutButton = document.getElementById('checkoutBtn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Fix the updateCartCount function to correctly calculate the total items
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0); // Ensure quantity is a number
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    // Ensure placeholder image path is correct
    const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="/shop/shop.html" class="shop-now-btn">Continue Shopping</a>
                </div>
            `;
            subtotalElement.textContent = '₹0';
            totalElement.textContent = '₹0';
            checkoutButton.disabled = true;
            updateCartCount(); // Ensure cart count is updated when cart is empty
            return;
        }

        checkoutButton.disabled = false;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='/assets/images/placeholder-product.jpg'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p class="price">₹${Number(item.price).toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-index="${index}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-index="${index}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            subtotal += Number(item.price) * item.quantity;
        });

        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        const shipping = subtotal > 0 ? 99 : 0;
        totalElement.textContent = `₹${(subtotal + shipping).toFixed(2)}`;

        addCartEventListeners();
        updateCartCount(); // Ensure cart count is updated after rendering items
    };

    const addCartEventListeners = () => {
        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').dataset.index;
                cart[index].quantity += 1;
                saveCart();
                renderCartItems();
            });
        });

        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                saveCart();
                renderCartItems();
            });
        });

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.closest('button').dataset.index;
                cart.splice(index, 1);
                saveCart();
                renderCartItems();
            });
        });
    };

    // Ensure updateCartCount is called after any cart modification
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    };

    // Define updateOrderSummary to avoid errors
    function updateOrderSummary() {
        console.log('Order summary updated.');
    }

    renderCartItems();
    updateCartCount(); // Call updateCartCount on page load to initialize the count
});