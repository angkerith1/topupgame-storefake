// Cart Management
let cart = [];
let selectedGame = '';

// Toggle Mobile Menu
const toggleBtn = document.querySelector('.toggle-btn');
const navLinks = document.querySelector('.nav-links');

toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Cart Toggle
const cartIcon = document.querySelector('.cart-icon');
const cartSummary = document.getElementById('cart-summary');
const closeCart = document.querySelector('.close-cart');

cartIcon.addEventListener('click', () => {
    cartSummary.classList.toggle('active');
    updateCartUI();
});

closeCart.addEventListener('click', () => {
    cartSummary.classList.remove('active');
});

// Game Selection
const gameItems = document.querySelectorAll('.game-item');
const ffPackages = document.getElementById('ff-packages');
const mlPackages = document.getElementById('ml-packages');
const zoneContainer = document.getElementById('zone-container');
const idStatus = document.getElementById('id-status');

gameItems.forEach(item => {
    item.addEventListener('click', () => {
        gameItems.forEach(game => game.classList.remove('selected'));
        item.classList.add('selected');
        selectedGame = item.getAttribute('data-game');

        idStatus.className = 'id-status';
        idStatus.style.display = 'none';
        idStatus.textContent = '';

        ffPackages.style.display = 'none';
        mlPackages.style.display = 'none';
        zoneContainer.style.display = selectedGame === 'mobilelegends' ? 'block' : 'none';
        cart = []; // Reset cart on game change
        updateCartUI();

        // TODO: Fetch packages from API
        // Example: fetchPackages(selectedGame).then(packages => updatePackagesUI(packages));
    });
});

// ID Validation
const checkIdBtn = document.getElementById('check-id');
const userIdInput = document.getElementById('userid');
const packageLoading = document.getElementById('package-loading');

checkIdBtn.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
        idStatus.textContent = 'Please enter your Game ID';
        idStatus.className = 'id-status invalid';
        idStatus.style.display = 'block';
        return;
    }

    if (!selectedGame) {
        idStatus.textContent = 'Please select a game first';
        idStatus.className = 'id-status invalid';
        idStatus.style.display = 'block';
        return;
    }

    packageLoading.classList.add('active');
    idStatus.style.display = 'none';

    // TODO: Replace with actual API call to backend or provider
    // Example: const response = await fetch(`/api/validate-id?game=${selectedGame}&userid=${userId}`);
    setTimeout(() => {
        packageLoading.classList.remove('active');
        const isValid = userId.length >= 5 && /^\d+$/.test(userId);

        if (isValid) {
            if (selectedGame === 'mobilelegends') {
                const zoneId = document.getElementById('zone').value.trim();
                if (!zoneId || !/^\d+$/.test(zoneId)) {
                    idStatus.textContent = zoneId ? 'Zone ID must be numeric' : 'Please enter your Zone ID';
                    idStatus.className = 'id-status invalid';
                    idStatus.style.display = 'block';
                    return;
                }
                idStatus.textContent = `ID found: Player Account #${userId} (Zone: ${zoneId})`;
            } else {
                idStatus.textContent = `ID found: Player Account #${userId}`;
            }

            idStatus.className = 'id-status valid';
            idStatus.style.display = 'block';

            const targetPackages = selectedGame === 'freefire' ? ffPackages : mlPackages;
            targetPackages.style.display = 'grid';
            document.querySelectorAll('.packages').forEach(pkg => {
                if (pkg !== targetPackages) pkg.style.display = 'none';
            });

            const packages = document.querySelectorAll('.package-item');
            packages.forEach((pkg, index) => {
                pkg.style.opacity = '0';
                pkg.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    pkg.style.transition = 'all 0.3s ease';
                    pkg.style.opacity = '1';
                    pkg.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        } else {
            idStatus.textContent = 'Invalid Game ID. Please check and try again.';
            idStatus.className = 'id-status invalid';
            idStatus.style.display = 'block';
            ffPackages.style.display = 'none';
            mlPackages.style.display = 'none';
        }
    }, 1500);
});

// Add to Cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const packageItem = button.closest('.package-item');
        const amount = packageItem.getAttribute('data-amount');
        const price = parseFloat(packageItem.getAttribute('data-price'));
        const image = packageItem.querySelector('img').src;

        const cartItem = {
            game: selectedGame,
            amount,
            price,
            image,
            id: `${selectedGame}-${amount}-${Date.now()}`
        };

        cart.push(cartItem);
        updateCartUI();
    });
});

// Update Cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    cartCount.textContent = cart.length;
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        cartTotal.textContent = '$0.00';
        return;
    }

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.amount} Diamonds">
            <div class="cart-item-details">
                <h4>${item.game === 'freefire' ? 'Free Fire' : 'Mobile Legends'}</h4>
                <p>${item.amount} Diamonds - $${item.price.toFixed(2)}</p>
            </div>
            <button class="cart-item-remove" data-index="${index}">Remove</button>
        `;
        cartItems.appendChild(itemElement);
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartUI();
        });
    });
}

// Checkout
const checkoutBtn = document.querySelector('.cart-checkout');
const topupForm = document.getElementById('topup-form');
const formLoading = document.getElementById('form-loading');
const successModal = document.getElementById('success-modal');
const closeModal = document.getElementById('close-modal');
const modalOk = document.getElementById('modal-ok');

checkoutBtn.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    const email = document.getElementById('email').value.trim();

    if (!selectedGame || !userId || !email || cart.length === 0) {
        alert('Please select a game, enter your Game ID, email, and add items to your cart.');
        return;
    }

    if (!idStatus.classList.contains('valid')) {
        alert('Please validate your Game ID first.');
        return;
    }

    if (selectedGame === 'mobilelegends') {
        const zoneId = document.getElementById('zone').value.trim();
        if (!zoneId) {
            alert('Please enter your Zone ID for Mobile Legends.');
            return;
        }
    }

    formLoading.classList.add('active');

    // TODO: Replace with actual API call to backend or provider
    // Example: const response = await fetch('/api/topup', { method: 'POST', body: JSON.stringify({ game: selectedGame, userId, items: cart, email }) });
    setTimeout(() => {
        formLoading.classList.remove('active');

        document.getElementById('modal-game').textContent = selectedGame === 'freefire' ? 'Free Fire' : 'Mobile Legends';
        document.getElementById('modal-id').textContent = userId;
        document.getElementById('modal-items').textContent = cart.map(item => `${item.amount} Diamonds`).join(', ');
        document.getElementById('modal-amount').textContent = `$${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;

        const timestamp = new Date().getTime().toString().slice(-10);
        const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase();
        document.getElementById('modal-transaction').textContent = `TX-${timestamp}${randomChars}`;

        successModal.classList.add('active');
        cartSummary.classList.remove('active');
    }, 2000);
});

closeModal.addEventListener('click', () => {
    successModal.classList.remove('active');
    resetForm();
});

modalOk.addEventListener('click', () => {
    successModal.classList.remove('active');
    resetForm();
});

function resetForm() {
    gameItems.forEach(game => game.classList.remove('selected'));
    ffPackages.style.display = 'none';
    mlPackages.style.display = 'none';
    idStatus.className = 'id-status';
    idStatus.style.display = 'none';
    zoneContainer.style.display = 'none';
    topupForm.reset();
    selectedGame = '';
    cart = [];
    updateCartUI();
}

// Scroll Animations
function animateSections() {
    const sections = document.querySelectorAll('.feature-card, .step-card, .game-item, .package-item');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.5s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100 * index);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
}

window.addEventListener('load', animateSections);