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

     // =============================
    //       DASHBOARD LOGIC
    // =============================
    if (page === 'index' || page === '') {
        const calculateTotals = () => {
            const totalAnimals = livestock.reduce((sum, animal) => sum + parseInt(animal.quantity, 10), 0);
            const healthyAnimals = livestock.filter(a => a.healthStatus === 'Healthy').reduce((sum, animal) => sum + parseInt(animal.quantity, 10), 0);
            const sickAnimals = totalAnimals - healthyAnimals;
            const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
            const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
            const netProfit = totalIncome - totalExpenses;

            get('total-animals').textContent = totalAnimals;
            get('healthy-animals').textContent = healthyAnimals;
            get('sick-animals').textContent = sickAnimals;
            get('total-income').textContent = `$${totalIncome.toLocaleString()}`;
            get('total-expenses').textContent = `$${totalExpenses.toLocaleString()}`;
            get('net-profit').textContent = `$${netProfit.toLocaleString()}`;
        };
        calculateTotals();
    }
     
    // =============================
    //       LIVESTOCK LOGIC
    // =============================
    if (page === 'livestock') {
        const form = get('livestock-form');
        const tableBody = get('livestock-table-body');
        const animalIdInput = get('animal-id');
        const submitBtn = get('submit-livestock-btn');
        const cancelBtn = get('cancel-edit-btn');
        const searchInput = get('search-livestock');
        const filterHealth = get('filter-health');
        
        const renderTable = () => {
            tableBody.innerHTML = '';
            const searchTerm = searchInput.value.toLowerCase();
            const healthFilter = filterHealth.value;
            const filteredLivestock = livestock.filter(animal => {
                const matchesSearch = animal.type.toLowerCase().includes(searchTerm) || animal.breed.toLowerCase().includes(searchTerm);
                const matchesHealth = healthFilter === 'all' || animal.healthStatus === healthFilter;
                return matchesSearch && matchesHealth;
            });
            
            if (filteredLivestock.length === 0) {
                 tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No livestock found.</td></tr>`;
                 return;
            }
            filteredLivestock.forEach(animal => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${animal.id}</td><td>${animal.type}</td><td>${animal.breed}</td><td>${animal.quantity}</td>
                        <td>${new Date(animal.dateAdded).toLocaleDateString()}</td>
                        <td><span class="status-${animal.healthStatus.toLowerCase().replace(/ /g, '-')}">${animal.healthStatus}</span></td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${animal.id}"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn" data-id="${animal.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        };

         form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = animalIdInput.value;
            const newAnimal = {
                id: id ? id : 'A' + Date.now(),
                type: get('animal-type').value, breed: get('animal-breed').value, quantity: get('animal-quantity').value,
                healthStatus: get('health-status').value, dateAdded: id ? livestock.find(a => a.id === id).dateAdded : new Date().toISOString()
            };
            if (id) livestock = livestock.map(animal => animal.id === id ? newAnimal : animal);
            else livestock.push(newAnimal);
            setData('livestock', livestock);
            form.reset(); animalIdInput.value = ''; submitBtn.textContent = 'Add Animal'; cancelBtn.classList.add('hidden');
            renderTable();
        });

        tableBody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const animal = livestock.find(a => a.id === editBtn.dataset.id);
                animalIdInput.value = animal.id; get('animal-type').value = animal.type; get('animal-breed').value = animal.breed;
                get('animal-quantity').value = animal.quantity; get('health-status').value = animal.healthStatus;
                submitBtn.textContent = 'Update Animal'; cancelBtn.classList.remove('hidden'); window.scrollTo(0, 0);
            }
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                if (confirm('Are you sure you want to delete this animal record?')) {
                    livestock = livestock.filter(animal => animal.id !== deleteBtn.dataset.id);
                    setData('livestock', livestock); renderTable();
                }
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            form.reset(); animalIdInput.value = ''; submitBtn.textContent = 'Add Animal'; cancelBtn.classList.add('hidden');
        });
        searchInput.addEventListener('input', renderTable);
        filterHealth.addEventListener('change', renderTable);
        renderTable();
    } 
    // =============================
    //       FINANCE LOGIC
    // =============================
    if (page === 'finance') {
        const renderFinance = () => {
            // Render tables
            get('income-table-body').innerHTML = income.map(item => `<tr><td>${item.source}</td><td>$${item.amount.toLocaleString()}</td><td>${new Date(item.date).toLocaleDateString()}</td><td><button class="action-btn delete-btn" data-id="${item.id}" data-type="income"><i class="fas fa-trash"></i></button></td></tr>`).join('');
            get('expenses-table-body').innerHTML = expenses.map(item => `<tr><td>${item.name}</td><td>$${item.amount.toLocaleString()}</td><td>${new Date(item.date).toLocaleDateString()}</td><td><button class="action-btn delete-btn" data-id="${item.id}" data-type="expenses"><i class="fas fa-trash"></i></button></td></tr>`).join('');
            // Update summary
            const totalIncome = income.reduce((s, i) => s + i.amount, 0);
            const totalExpenses = expenses.reduce((s, i) => s + i.amount, 0);
            get('finance-total-income').textContent = `$${totalIncome.toLocaleString()}`;
            get('finance-total-expenses').textContent = `$${totalExpenses.toLocaleString()}`;
            get('finance-net-profit').textContent = `$${(totalIncome - totalExpenses).toLocaleString()}`;
        };

        get('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            income.push({id: 'I' + Date.now(), source: get('income-source').value, amount: parseFloat(get('income-amount').value), date: new Date().toISOString()});
            setData('income', income); renderFinance(); e.target.reset();
        });

        get('expenses-form').addEventListener('submit', (e) => {
            e.preventDefault();
            expenses.push({id: 'E' + Date.now(), name: get('expense-name').value, amount: parseFloat(get('expense-amount').value), date: new Date().toISOString()});
            setData('expenses', expenses); renderFinance(); e.target.reset();
        });
        
        document.body.addEventListener('click', (e) => {
             const deleteBtn = e.target.closest('.delete-btn[data-type]');
             if (deleteBtn && confirm('Are you sure you want to delete this financial record?')) {
                 if (deleteBtn.dataset.type === 'income') income = income.filter(i => i.id !== deleteBtn.dataset.id);
                 else expenses = expenses.filter(i => i.id !== deleteBtn.dataset.id);
                 setData(deleteBtn.dataset.type, deleteBtn.dataset.type === 'income' ? income : expenses);
                 renderFinance();
             }
        });
        renderFinance();
    }
});

