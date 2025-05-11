document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('ordersContainer');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-box-open"></i>
                <p>You haven't placed any orders yet</p>
                <a href="/shop/shop.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <label for="statusFilter">Filter by Status:</label>
        <select id="statusFilter">
            <option value="all">All</option>
            <option value="Placed">Placed</option>
            <option value="Courier Partner Assigned">Courier Partner Assigned</option>
            <option value="Sent to Hub">Sent to Hub</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
        </select>
    `;
    ordersContainer.parentElement.insertBefore(filterContainer, ordersContainer);

    const statusFilter = document.getElementById('statusFilter');

    function renderOrders(filteredOrders) {
        ordersContainer.innerHTML = '';

        if (filteredOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-orders">
                    <i class="fas fa-box-open"></i>
                    <p>No orders found for the selected status.</p>
                </div>
            `;
            return;
        }

        filteredOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';

            const orderItems = Array.isArray(order.items) ? order.items : [];

            orderCard.innerHTML = `
                <div class="order-header">
                    <div>
                        <h4>Order ID: ${order.orderId}</h4>
                        <p>Date: ${order.date}</p>
                    </div>
                    <div>
                        <p>Status: <span class="order-status clickable">${order.status}</span></p>
                    </div>
                </div>
                <div class="order-items">
                    ${orderItems.length > 0 ? orderItems.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.title}" onerror="this.src='/assets/images/placeholder-product.jpg'">
                            <p>${item.title} - ₹${(Number(item.price) || 0).toFixed(2)} x ${item.quantity}</p>
                        </div>
                    `).join('') : '<p>No items found for this order.</p>'}
                </div>
                <div class="order-total">
                    <p>Total: ₹${(Number(order.total) || 0).toFixed(2)}</p>
                </div>
                <div class="live-date-time">
                    <p>Live Date & Time: <span class="date-time"></span></p>
                </div>
            `;

            ordersContainer.appendChild(orderCard);

            const dateTimeElement = orderCard.querySelector('.date-time');
            setInterval(() => {
                const now = new Date();
                dateTimeElement.textContent = now.toLocaleString();
            }, 1000);

            const statusElement = orderCard.querySelector('.order-status');
            statusElement.addEventListener('click', () => {
                alert(`Order Details:\n\nOrder ID: ${order.orderId}\nDate: ${order.date}\nStatus: ${order.status}\n\nItems:\n${orderItems.map(item => `${item.title} - ₹${(Number(item.price) || 0).toFixed(2)} x ${item.quantity}`).join('\n')}`);
            });
        });
    }

    renderOrders(orders);

    statusFilter.addEventListener('change', () => {
        const selectedStatus = statusFilter.value;
        const filteredOrders = selectedStatus === 'all' ? orders : orders.filter(order => order.status === selectedStatus);
        renderOrders(filteredOrders);
    });
});