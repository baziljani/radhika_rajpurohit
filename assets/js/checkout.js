document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editAddress');
    const cancelBtn = document.getElementById('cancelAddress');
    const saveBtn = document.getElementById('saveAddress');
    const addressForm = document.querySelector('.address-form');
    const addressCard = document.querySelector('.address-card');
    const addressDetails = addressCard.querySelector('.address-details');
    const summaryItemsContainer = document.getElementById('summaryItems');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const totalElement = document.getElementById('total');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const verifyUpiBtn = document.getElementById('verifyUpiBtn');
    const creditCardOption = document.getElementById('creditCardOption');
    const upiOption = document.getElementById('upiOption');
    const upiAppsContainer = document.getElementById('upiAppsContainer');

    let paymentMethod = 'credit_card';

    // Toggle address form visibility
    editBtn.addEventListener('click', () => toggleAddressForm(true));
    cancelBtn.addEventListener('click', () => toggleAddressForm(false));

    saveBtn.addEventListener('click', () => {
        const updatedAddress = getAddressFromForm();
        if (!updatedAddress) {
            alert('Please fill in all required fields.');
            return;
        }

        localStorage.setItem('deliveryAddress', JSON.stringify(updatedAddress));
        updateAddressCard(updatedAddress);
        toggleAddressForm(false);
    });

    // Load order summary from localStorage
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary'));
    if (!orderSummary || !orderSummary.items || orderSummary.items.length === 0) {
        alert('No items in your cart. Redirecting to shop...');
        window.location.href = '/shop/shop.html';
        return;
    }

    renderOrderSummary(orderSummary);

    // Handle payment method selection
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            paymentMethod = e.target.id === 'creditCard' ? 'credit_card' : 'upi';
            togglePaymentMethod(paymentMethod);
        });
    });

    // Verify UPI ID
    verifyUpiBtn.addEventListener('click', () => {
        const upiId = document.getElementById('upiId').value;
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., name@upi)');
            return;
        }

        simulateProcessing('upiProcessing', () => {
            alert(`UPI ID ${upiId} verified successfully!`);
        });
    });

    // Add click event listeners for UPI app buttons
    document.querySelectorAll('.upi-app-btn').forEach(button => {
        button.addEventListener('click', () => {
            const app = button.textContent.trim();
            let upiId = '';

            switch (app) {
                case 'GPay':
                    upiId = 'gpay://upi/pay?pa=merchant@upi&pn=MerchantName&mc=1234&tid=txn12345&tr=order12345&tn=Payment%20for%20Order&am=100&cu=INR';
                    break;
                case 'PhonePe':
                    upiId = 'phonepe://upi/pay?pa=merchant@upi&pn=MerchantName&mc=1234&tid=txn12345&tr=order12345&tn=Payment%20for%20Order&am=100&cu=INR';
                    break;
                case 'Paytm':
                    upiId = 'paytm://upi/pay?pa=merchant@upi&pn=MerchantName&mc=1234&tid=txn12345&tr=order12345&tn=Payment%20for%20Order&am=100&cu=INR';
                    break;
                default:
                    alert('Unsupported UPI app');
                    return;
            }

            // Open the UPI app with the payment request
            window.location.href = upiId;
            setTimeout(() => {
                alert('If the app did not open, please ensure it is installed on your device.');
            }, 2000);
        });
    });

    // Toggle payment method options
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const paymentMethod = e.target.id;
            const upiAppsContainer = document.getElementById('upiAppsContainer');
            if (paymentMethod === 'upi') {
                upiAppsContainer.style.display = 'block';
            } else {
                upiAppsContainer.style.display = 'none';
            }
        });
    });

    // Update Place Order functionality
    placeOrderBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const deliveryAddress = JSON.parse(localStorage.getItem('deliveryAddress'));
        if (!deliveryAddress) {
            alert('Please save your delivery address first');
            return;
        }

        if (paymentMethod === 'credit_card') {
            const cardDetails = getCardDetails();
            if (!cardDetails) {
                alert('Please fill in all card details');
                return;
            }

            simulateProcessing('cardProcessing', async () => {
                const paymentSuccess = await processPayment(cardDetails);
                if (paymentSuccess) {
                    completeOrder(orderSummary, deliveryAddress);
                } else {
                    alert('Payment failed. Please try another payment method.');
                }
            });
        } else {
            alert('Please select a valid payment method.');
        }
    });

    // Update Verify Card Details functionality
    document.getElementById('verifyCardDetails').addEventListener('click', () => {
        const cardDetails = {
            cardNumber: document.querySelector('.card-input[placeholder="Card Number"]').value,
            expiry: document.querySelector('.card-input[placeholder="MM/YY"]').value,
            cvv: document.querySelector('.card-input[placeholder="CVV"]').value
        };

        if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
            alert('Please fill in all card details.');
            return;
        }

        verifyCardDetailsWithOTP(cardDetails, (isVerified) => {
            if (isVerified) {
                alert('Card details verified successfully! You can now proceed with the payment.');
                placeOrderBtn.disabled = false; // Enable the Place Order button
            } else {
                alert('Card verification failed. Please try again.');
            }
        });
    });

    // Ensure cardInput exists before accessing its parentElement
    const cardInput = document.querySelector('.card-input[placeholder="Card Number"]');
    if (cardInput) {
        const cardTypeDisplay = document.createElement('span');
        cardTypeDisplay.style.marginLeft = '10px';
        cardInput.parentElement.appendChild(cardTypeDisplay);

        cardInput.addEventListener('input', () => {
            const cardNumber = cardInput.value.replace(/\s+/g, ''); // Remove spaces
            let cardType = '';

            if (/^4/.test(cardNumber)) {
                cardType = 'Visa';
            } else if (/^5[1-5]/.test(cardNumber)) {
                cardType = 'MasterCard';
            } else if (/^6/.test(cardNumber)) {
                cardType = 'RuPay';
            } else {
                cardType = '';
            }

            cardTypeDisplay.textContent = cardType;
        });
    } else {
        console.error('Card input element not found.');
    }

    // Ensure expiryInput exists before adding event listener
    const expiryInput = document.querySelector('.card-input[placeholder="MM/YY"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = expiryInput.value.replace(/\D/g, ''); // Remove non-digit characters

            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }

            expiryInput.value = value;
        });
    } else {
        console.error('Expiry input element not found.');
    }

    // Helper Functions
    function toggleAddressForm(show) {
        addressCard.style.display = show ? 'none' : 'block';
        addressForm.style.display = show ? 'block' : 'none';
    }

    function getAddressFromForm() {
        const fullName = addressForm.querySelector('input[placeholder="Full Name"]').value;
        const mobile = addressForm.querySelector('input[placeholder="Mobile Number"]').value;
        const pincode = addressForm.querySelector('input[placeholder="Pincode"]').value;
        const address = addressForm.querySelector('textarea').value;
        const city = addressForm.querySelector('input[placeholder="City"]').value;
        const state = addressForm.querySelector('input[placeholder="State"]').value;

        if (!fullName || !mobile || !pincode || !address || !city || !state) return null;

        return { fullName, mobile, pincode, address, city, state };
    }

    function updateAddressCard(address) {
        addressDetails.innerHTML = `
            <h3>${address.fullName}</h3>
            <p>${address.address},</p>
            <p>${address.city} - ${address.pincode}</p>
            <p>${address.state}</p>
            <p>Mobile: ${address.mobile}</p>
        `;
    }

    function renderOrderSummary(orderSummary) {
        orderSummary.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.title}" 
                         onerror="this.src='/assets/images/placeholder-product.jpg'" 
                         style="width: 100px; height: 100px; object-fit: cover;">
                </div>
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                </div>
            `;
            summaryItemsContainer.appendChild(itemElement);
        });

        subtotalElement.textContent = `₹${orderSummary.subtotal.toFixed(2)}`;
        deliveryElement.textContent = `₹${orderSummary.shipping.toFixed(2)}`;
        totalElement.textContent = `₹${orderSummary.total.toFixed(2)}`;
    }

    function togglePaymentMethod(method) {
        if (creditCardOption) {
            creditCardOption.style.display = method === 'credit_card' ? 'block' : 'none';
        }
        if (upiOption) {
            upiOption.style.display = method === 'upi' ? 'block' : 'none';
        }
        if (upiAppsContainer) {
            upiAppsContainer.style.display = method === 'upi' ? 'block' : 'none';
        }
    }

    function getCardDetails() {
        const cardNumberInput = document.getElementById('cardNumber');
        const cardExpiryInput = document.getElementById('cardExpiry');
        const cardCvvInput = document.getElementById('cardCvv');
        const cardNameInput = document.getElementById('cardName');

        if (!cardNumberInput || !cardExpiryInput || !cardCvvInput || !cardNameInput) {
            console.error('One or more card input elements are missing.');
            return null;
        }

        const cardNumber = cardNumberInput.value;
        const cardExpiry = cardExpiryInput.value;
        const cardCvv = cardCvvInput.value;
        const cardName = cardNameInput.value;

        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
            alert('Please fill in all card details.');
            return null;
        }

        return { cardNumber, cardExpiry, cardCvv, cardName };
    }

    function simulateProcessing(processingId, callback) {
        const processingElement = document.getElementById(processingId);
        if (processingElement) {
            processingElement.style.display = 'block';

            setTimeout(() => {
                processingElement.style.display = 'none';
                callback();
            }, 2000);
        } else {
            console.error(`Processing element with ID '${processingId}' not found.`);
            callback();
        }
    }

    function processPayment(details) {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Processing payment with:', details);
                resolve(Math.random() > 0.2); // Simulate 80% success rate
            }, 3000);
        });
    }

    function completeOrder(orderSummary, deliveryAddress) {
        const orderData = {
            orderId: 'ORD-' + Date.now(),
            date: new Date().toLocaleString(),
            items: orderSummary.items,
            subtotal: orderSummary.subtotal,
            shipping: orderSummary.shipping,
            discount: orderSummary.discount,
            total: orderSummary.total,
            status: 'Placed', // Initialize order status
            paymentMethod: paymentMethod === 'credit_card' ? 'Credit Card' : 'UPI',
            address: deliveryAddress,
            trackingId: 'TRK-' + Math.floor(Math.random() * 10000000),
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        localStorage.removeItem('cart');
        localStorage.removeItem('orderSummary');

        window.location.href = '/account/orders.html';
    }

    function verifyCardDetailsWithOTP(cardDetails, callback) {
        const otp = prompt('Enter the OTP sent to your registered mobile number:');

        if (!otp || otp.length !== 6) {
            alert('Invalid OTP. Please try again.');
            return;
        }

        simulateProcessing('otpProcessing', () => {
            const isOtpValid = Math.random() > 0.2; // Simulate 80% success rate for OTP verification
            if (isOtpValid) {
                alert('OTP verified successfully!');
                callback(true);
            } else {
                alert('OTP verification failed. Please try again.');
                callback(false);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById('checkoutButton');

    if (!checkoutButton) {
        console.error('Checkout button not found in the DOM');
        return;
    }

    checkoutButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
            alert('Your cart is empty. Add items to proceed.');
            return;
        }

        const order = {
            orderId: `ORD-${Date.now()}`,
            date: new Date().toLocaleString(),
            items: cart.map(item => ({
                ...item,
                price: Number(item.price) // Ensure price is treated as a number
            })),
            status: 'Placed',
            total: cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) + 99
        };

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        localStorage.removeItem('cart');

        alert('Order placed successfully!');
        window.location.href = '/account/orders.html';
    });

    const renderOrderSummary = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const orderSummaryContainer = document.getElementById('orderSummary');

        if (!orderSummaryContainer) {
            console.error('Order summary container not found in the DOM');
            return;
        }

        if (cart.length === 0) {
            orderSummaryContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        let subtotal = 0;
        orderSummaryContainer.innerHTML = cart.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='/assets/images/placeholder-product.jpg'" style="width: 80px; height: 80px; object-fit: cover;">
                <p>${item.title} - ₹${Number(item.price).toFixed(2)} x ${item.quantity}</p>
            </div>
        `).join('');

        subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        const shipping = subtotal > 0 ? 99 : 0;
        const total = subtotal + shipping;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `₹${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    };

    renderOrderSummary();
});