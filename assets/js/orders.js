document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('ordersContainer');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>No orders found. Start shopping now!</p>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');
        orderCard.innerHTML = `
            <h3>Order ID: ${order.orderId}</h3>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <h4>Delivery Address:</h4>
            <p>${order.address.fullName}</p>
            <p>${order.address.address}, ${order.address.city} - ${order.address.pincode}</p>
            <p>${order.address.state}</p>
            <p><strong>Mobile:</strong> ${order.address.mobile}</p>
            <h4>Items:</h4>
            <ul>
                ${order.cart.items.map(item => `
                    <li>
                        ${item.name} - ₹${item.offerPrice} x ${item.quantity}
                    </li>
                `).join('')}
            </ul>
            <h4>Order Summary:</h4>
            <p><strong>Subtotal:</strong> ₹${order.cart.subtotal}</p>
            <p><strong>Delivery:</strong> ₹${order.cart.shipping}</p>
            <p><strong>Total:</strong> ₹${order.cart.total}</p>
        `;
        ordersContainer.appendChild(orderCard);
    });
});