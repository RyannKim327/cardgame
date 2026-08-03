import api from '../process/api.js';

export function initAuth(onLoginSuccess) {
    const authView = document.getElementById('auth-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const linkShowRegister = document.getElementById('link-show-register');
    const linkShowLogin = document.getElementById('link-show-login');

    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');

    linkShowRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    linkShowLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    btnLogin.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        const client = api();
        const res = await client.post('/login', { username, password });

        if (res && res.success && res.user) {
            onLoginSuccess(res.user);
        } else {
            alert(res.error || 'Invalid username or password.');
        }
    });

    // TODO: Mock Register
    btnRegister.addEventListener('click', () => {
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (!username || !password) {
            alert('Username and Password are required');
            return;
        }

        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }

        alert('Registration successful! Please login.');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
}

export function showAuth() {
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('lobby-view').classList.add('hidden');
}

export function hideAuth() {
    document.getElementById('auth-view').classList.add('hidden');
}
