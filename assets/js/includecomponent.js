function includeComponents() {
    const includes = document.querySelectorAll('[data-include]');
    
    includes.forEach(element => {
        const file = element.getAttribute('data-include');
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error('Include failed');
                return response.text();
            })
            .then(data => {
                element.innerHTML = data;
                initDynamicComponents();
            })
            .catch(error => {
                console.error('Include error:', error);
                element.innerHTML = 'Component load failed';
            });
    });
}

function initDynamicComponents() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (mainNav && mobileToggle && !mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    includeComponents();
});