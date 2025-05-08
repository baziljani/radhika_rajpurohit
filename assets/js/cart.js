document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const totalElement = document.getElementById('total');
    const couponCodeInput = document.getElementById('couponCode');
    const applyCouponButton = document.getElementById('applyCoupon');
    const giftCardInput = document.getElementById('giftCardCode');
    const applyGiftCardButton = document.getElementById('applyGiftCard');
    const checkoutButton = document.getElementById('checkoutBtn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;
    let discount = 0;

    const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';
        subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty. Start shopping now!</p>
                    <a href="/shop/shop.html" class="shop-now-btn">Shop Now</a>
                </div>
            `;
            subtotalElement.textContent = '₹0';
            totalElement.textContent = '₹99';
            return;
        }

        cart.forEach((item, index) => {
            const itemRow = document.createElement('div');
            itemRow.classList.add('cart-item');
            itemRow.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>Price: ₹${item.price}</p>
                    <div class="quantity-controls">
                        <button class="decrease-qty" data-index="${index}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="increase-qty" data-index="${index}">+</button>
                    </div>
                    <button class="remove-item" data-index="${index}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemRow);
            subtotal += item.price * item.quantity;
        });

        subtotalElement.textContent = `₹${subtotal}`;
        totalElement.textContent = `₹${subtotal + 99 - discount}`;

        addCartEventListeners();
    };

    const addCartEventListeners = () => {
        document.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                cart[index].quantity += 1;
                saveCart();
                renderCartItems();
            });
        });

        document.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    saveCart();
                    renderCartItems();
                }
            });
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                cart.splice(index, 1);
                saveCart();
                renderCartItems();
            });
        });
    };

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    applyCouponButton.addEventListener('click', () => {
        const couponCode = couponCodeInput.value.trim();
        if (couponCode === "SAVE10") {
            discount = subtotal * 0.1;
            discountElement.textContent = `₹${discount.toFixed(2)}`;
            totalElement.textContent = `₹${(subtotal + 99 - discount).toFixed(2)}`;
            alert("Coupon applied successfully!");
        } else {
            alert("Invalid coupon code.");
        }
    });

    applyGiftCardButton.addEventListener('click', () => {
        const giftCardCode = giftCardInput.value.trim();
        if (giftCardCode === "GIFT500") {
            discount += 500;
            discountElement.textContent = `₹${discount.toFixed(2)}`;
            totalElement.textContent = `₹${(subtotal + 99 - discount).toFixed(2)}`;
            alert("Gift card applied successfully!");
        } else {
            alert("Invalid gift card code.");
        }
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Add items to proceed.");
            return;
        }

        const cartData = {
            items: cart,
            subtotal: subtotal,
            discount: discount,
            shipping: 99,
            total: subtotal + 99 - discount
        };

        localStorage.setItem('cart', JSON.stringify(cartData));
        window.location.href = '/checkout/checkout.html';
    });

    renderCartItems();
});