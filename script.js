// Toggle between Login and Register forms
function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

// Handle Login
document.getElementById('login').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const loginError = document.getElementById('loginError'); // Error message element

    // Reset error message
    loginError.textContent = '';
    loginError.classList.add('hidden');

    if (!email || !password) {
        loginError.textContent = 'Both email and password are required.';
        loginError.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok) {
            // Store login status, role, and username in localStorage
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);  // Store username

            // Redirect based on role
            switch (data.role) {
                case 'admin':
                    window.location.href = 'admin_dashboard.html';
                    break;
                case 'moderator':
                    window.location.href = 'studenteramoderator.html';
                    break;
                case 'viewer':
                    window.location.href = 'studenteravieweronly.html';
                    break;
                case 'maintanance':
                    window.location.href = 'studenteramaintenance.html';
                    break;
                case 'finance':
                    window.location.href = 'studenterafinance.html';
                    break;
                default:
                    window.location.href = 'underconstruction.html';  // Default redirection for unknown roles
                    break;
            }
        } else {
            loginError.textContent = data.message || 'Invalid credentials, please try again.';
            loginError.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        loginError.textContent = 'An error occurred. Please try again later.';
        loginError.classList.remove('hidden');
    }
});

// Handle Registration
document.getElementById('register').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value.trim(); // Default is "user"
    const registerError = document.getElementById('registerError'); // Error message element

    // Reset error message
    registerError.textContent = '';
    registerError.classList.add('hidden');

    // Role validation (optional)
    const validRoles = ["user", "admin", "moderator", "viewer", "maintanance", "finance"];
    if (!validRoles.includes(role)) {
        registerError.textContent = 'Invalid role provided.';
        registerError.classList.remove('hidden');
        return;
    }

    if (!username || !email || !password || !role) {
        registerError.textContent = 'All fields are required.';
        registerError.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role }),
        });
        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please log in.');
            toggleForm(); // Switch to login form
        } else {
            registerError.textContent = data.message || 'An error occurred. Please try again.';
            registerError.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error registering:', error);
        registerError.textContent = 'An error occurred. Please try again later.';
        registerError.classList.remove('hidden');
    }
});