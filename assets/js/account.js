document.addEventListener('DOMContentLoaded', () => {
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addressForm = document.getElementById('addressForm');
    const addressList = document.querySelector('.address-list');
    let addresses = JSON.parse(localStorage.getItem('addresses')) || [];

    function renderAddresses() {
        addressList.innerHTML = '';

        if (addresses.length === 0) {
            addressList.innerHTML = '<p>No addresses saved. Add a new address.</p>';
            return;
        }

        addresses.forEach((address, index) => {
            const addressCard = document.createElement('div');
            addressCard.classList.add('address-card');
            addressCard.innerHTML = `
                <h3>${address.fullName}</h3>
                <p>${address.address}, ${address.city}, ${address.state} - ${address.pincode}</p>
                <p><strong>Mobile:</strong> ${address.mobile}</p>
                <div class="address-actions">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
            addressList.appendChild(addressCard);
        });
    }

    addAddressBtn.addEventListener('click', () => {
        addressForm.style.display = 'block';
        addressForm.reset();
        addressForm.dataset.editIndex = '';
    });

    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('addressFullName').value;
        const address = document.getElementById('addressLine').value;
        const city = document.getElementById('addressCity').value;
        const state = document.getElementById('addressState').value;
        const pincode = document.getElementById('addressPincode').value;
        const mobile = document.getElementById('addressMobile').value;

        const newAddress = { fullName, address, city, state, pincode, mobile };

        const editIndex = addressForm.dataset.editIndex;
        if (editIndex) {
            addresses[editIndex] = newAddress;
        } else {
            addresses.push(newAddress);
        }

        localStorage.setItem('addresses', JSON.stringify(addresses));
        addressForm.style.display = 'none';
        renderAddresses();
    });

    addressList.addEventListener('click', (e) => {
        const index = e.target.dataset.index;

        if (e.target.classList.contains('edit-btn')) {
            const address = addresses[index];
            document.getElementById('addressFullName').value = address.fullName;
            document.getElementById('addressLine').value = address.address;
            document.getElementById('addressCity').value = address.city;
            document.getElementById('addressState').value = address.state;
            document.getElementById('addressPincode').value = address.pincode;
            document.getElementById('addressMobile').value = address.mobile;

            addressForm.style.display = 'block';
            addressForm.dataset.editIndex = index;
        } else if (e.target.classList.contains('delete-btn')) {
            addresses.splice(index, 1);
            localStorage.setItem('addresses', JSON.stringify(addresses));
            renderAddresses();
        }
    });

    renderAddresses();
});