document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editAddress');
    const cancelBtn = document.getElementById('cancelAddress');
    const saveBtn = document.getElementById('saveAddress');
    const addressForm = document.querySelector('.address-form');
    const addressCard = document.querySelector('.address-card');
    const addressDetails = addressCard.querySelector('.address-details');

    editBtn.addEventListener('click', () => {
        addressCard.style.display = 'none';
        addressForm.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        addressForm.style.display = 'none';
        addressCard.style.display = 'block';
    });

    saveBtn.addEventListener('click', () => {
        const fullName = addressForm.querySelector('input[placeholder="Full Name"]').value;
        const mobile = addressForm.querySelector('input[placeholder="Mobile Number"]').value;
        const pincode = addressForm.querySelector('input[placeholder="Pincode"]').value;
        const address = addressForm.querySelector('textarea').value;
        const city = addressForm.querySelector('input[placeholder="City"]').value;
        const state = addressForm.querySelector('input[placeholder="State"]').value;

        if (!fullName || !mobile || !pincode || !address || !city || !state) {
            alert('Please fill in all required fields.');
            return;
        }

        const updatedAddress = {
            fullName,
            mobile,
            pincode,
            address,
            city,
            state
        };
        localStorage.setItem('deliveryAddress', JSON.stringify(updatedAddress));

        addressDetails.innerHTML = `
            <h3>${fullName}</h3>
            <p>${address},</p>
            <p>${city} - ${pincode}</p>
            <p>${state}</p>
            <p>Mobile: ${mobile}</p>
        `;

        addressForm.style.display = 'none';
        addressCard.style.display = 'block';
    });

    const cartData = JSON.parse(localStorage.getItem('cartData'));
    const summaryItemsContainer = document.getElementById('summaryItems');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const totalElement = document.getElementById('total');

    if (cartData) {
        cartData.items.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.classList.add('summary-item');
            itemRow.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: ₹${item.offerPrice}</p>
                </div>
            `;
            summaryItemsContainer.appendChild(itemRow);
        });

        subtotalElement.textContent = `₹${cartData.subtotal}`;
        deliveryElement.textContent = `₹${cartData.shipping}`;
        totalElement.textContent = `₹${cartData.total}`;
    } else {
        alert('No cart data found. Redirecting to cart page.');
        window.location.href = '/cart/cart.html';
    }

    document.querySelectorAll('.payment-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-card').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
        });
    });

    document.querySelector('.place-order-btn').addEventListener('click', (e) => {
        e.preventDefault();

        const selectedPayment = document.querySelector('.payment-card.active');
        if (!selectedPayment) {
            alert('Please select a payment method.');
            return;
        }

        const deliveryAddress = JSON.parse(localStorage.getItem('deliveryAddress'));
        const cartData = JSON.parse(localStorage.getItem('cartData'));

        if (!deliveryAddress || !cartData) {
            alert('Missing address or cart data. Please complete the checkout process.');
            return;
        }

        const orderData = {
            orderId: `ORD${Date.now()}`,
            date: new Date().toLocaleString(),
            address: deliveryAddress,
            paymentMethod: selectedPayment.querySelector('label').textContent.trim(),
            cart: cartData
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        existingOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        localStorage.removeItem('cartData');

        alert('Order placed successfully!');
        window.location.href = '/myaccount/orders.html';
    });
});