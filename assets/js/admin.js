document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Panel Loaded');

    // Add event listeners for navigation
    const navLinks = document.querySelectorAll('header nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    const productTable = document.getElementById('productTable').querySelector('tbody');
    const productFormContainer = document.getElementById('productFormContainer');
    const productForm = document.getElementById('productForm');
    const addProductBtn = document.getElementById('addProductBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const formTitle = document.getElementById('formTitle');

    const orderTable = document.getElementById('orderTable').querySelector('tbody');
    const userTable = document.getElementById('userTable').querySelector('tbody');
    const totalProducts = document.getElementById('totalProducts');
    const totalOrders = document.getElementById('totalOrders');
    const totalUsers = document.getElementById('totalUsers');
    const orderFilter = document.createElement('select');

    let editingProduct = null;
    let products = [];
    let orders = [];
    let users = [];

    // Update Dashboard
    function updateDashboard() {
        totalProducts.textContent = products.length;
        totalOrders.textContent = orders.length;
        totalUsers.textContent = users.length;
    }

    // Add Product
    function addProduct(name, price, stock) {
        const product = { id: products.length + 1, name, price, stock };
        products.push(product);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;
        productTable.appendChild(row);
        updateDashboard();
    }

    // Add Order
    function addOrder(customer, status) {
        const order = { id: orders.length + 1, customer, status };
        orders.push(order);
        renderOrders();
        updateDashboard();
    }

    // Render Orders
    function renderOrders() {
        orderTable.innerHTML = '';
        const filteredOrders = orderFilter.value ? orders.filter(order => order.status === orderFilter.value) : orders;
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.status}</td>
                <td>
                    <button class="updateBtn">Update</button>
                </td>
            `;
            row.querySelector('.updateBtn').addEventListener('click', () => updateOrderStatus(order));
            orderTable.appendChild(row);
        });
    }

    // Update Order Status
    function updateOrderStatus(order) {
        const newStatus = prompt('Enter new status (e.g., Pending, Shipped, Delivered):', order.status);
        if (newStatus) {
            order.status = newStatus;
            renderOrders();
        }
    }

    // Load user list from localStorage
    function loadUserList() {
        const storedUsers = localStorage.getItem('userList');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
            renderUsers();
        }
    }

    // Save user list to localStorage
    function saveUserList() {
        localStorage.setItem('userList', JSON.stringify(users));
    }

    // Add User
    function addUser(name, email) {
        const user = { id: users.length + 1, name, email };
        users.push(user);
        saveUserList();
        renderUsers();
        updateDashboard();
    }

    // Render Users
    function renderUsers() {
        userTable.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="blockBtn">Block</button>
                </td>
            `;
            row.querySelector('.blockBtn').addEventListener('click', () => blockUser(user));
            userTable.appendChild(row);
        });
    }

    // Block User
    function blockUser(user) {
        alert(`User ${user.name} has been blocked.`);
        // Optionally, update the user list or add a blocked status
    }

    // Add Filter for Orders
    orderFilter.innerHTML = `
        <option value="">All</option>
        <option value="Pending">Pending</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
    `;
    orderFilter.addEventListener('change', renderOrders);
    document.getElementById('orders').prepend(orderFilter);

    // Show the form to add a new product
    addProductBtn.addEventListener('click', () => {
        formTitle.textContent = 'Add Product';
        productForm.reset();
        productFormContainer.style.display = 'block';
        editingProduct = null;
    });

    // Hide the form
    cancelFormBtn.addEventListener('click', () => {
        productFormContainer.style.display = 'none';
    });

    // Handle form submission
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('productName').value;
        const price = document.getElementById('productPrice').value;
        const stock = document.getElementById('productStock').value;

        if (editingProduct) {
            // Update existing product
            editingProduct.querySelector('.name').textContent = name;
            editingProduct.querySelector('.price').textContent = price;
            editingProduct.querySelector('.stock').textContent = stock;
        } else {
            // Add new product
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="name">${name}</td>
                <td class="price">${price}</td>
                <td class="stock">${stock}</td>
                <td>
                    <button class="editBtn">Edit</button>
                    <button class="deleteBtn">Delete</button>
                </td>
            `;
            productTable.appendChild(row);

            // Add event listeners for edit and delete buttons
            row.querySelector('.editBtn').addEventListener('click', () => editProduct(row));
            row.querySelector('.deleteBtn').addEventListener('click', () => deleteProduct(row));
        }

        productFormContainer.style.display = 'none';
    });

    // Edit a product
    function editProduct(row) {
        editingProduct = row;
        formTitle.textContent = 'Edit Product';
        document.getElementById('productName').value = row.querySelector('.name').textContent;
        document.getElementById('productPrice').value = row.querySelector('.price').textContent;
        document.getElementById('productStock').value = row.querySelector('.stock').textContent;
        productFormContainer.style.display = 'block';
    }

    // Delete a product
    function deleteProduct(row) {
        row.remove();
    }

    // Load logged-in user details into Manage Users
    function loadLoggedInUser() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const userDetails = JSON.parse(loggedInUser);
            addUser(userDetails.name, userDetails.email);
        }
    }

    // Call loadLoggedInUser on page load
    loadLoggedInUser();

    // Load user list on page load
    loadUserList();

    // Example Data
    addProduct('Product 1', 100, 10);
    addProduct('Product 2', 200, 5);
    addOrder('Customer 1', 'Pending');
    addOrder('Customer 2', 'Shipped');
    addUser('User 1', 'user1@example.com');
    addUser('User 2', 'user2@example.com');
});
