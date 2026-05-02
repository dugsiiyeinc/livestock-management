document.addEventListener('DOMContentLoaded', () => {

    // --- AUTHENTICATION ---
    const CORRECT_USERNAME = 'admin';
    const CORRECT_PASSWORD = '12345678';
    const page = document.body.id || window.location.pathname.split('/').pop().split('.')[0];
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // Redirect to login if not authenticated
    if (!isLoggedIn && page !== 'index') {
        window.location.href = 'index.html';
        return; // Stop further script execution
    }

    // Show login or app on the index page
    if (page === 'index' || page === '') {
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.querySelector('.app-container');
        const loginForm = document.getElementById('login-form');

        if (isLoggedIn) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'flex';
        } else {
            loginContainer.style.display = 'flex';
            appContainer.style.display = 'none';
            loginForm.addEventListener('submit', handleLogin);
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('login-error');

        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.reload();
        } else {
            loginError.textContent = 'Invalid username or password.';
        }
    }
    
    function handleLogout() {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Stop executing app-specific code if not logged in
    if (!isLoggedIn) return;


    // --- APP LOGIC (only runs if logged in) ---

    // --- UTILITY FUNCTIONS ---
    const get = (id) => document.getElementById(id);
    const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    let livestock = getData('livestock');
    let income = getData('income');
    let expenses = getData('expenses');

    // --- THEME MANAGEMENT ---
    const themeToggler = document.querySelector('.theme-toggler');
    if (themeToggler) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') document.body.classList.add('dark-mode');
        themeToggler.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        });
    }
