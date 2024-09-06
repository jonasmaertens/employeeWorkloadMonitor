function showSignupForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'flex';
    document.getElementById('toggle-form').innerHTML = 'Already registered? <a href="#" onclick="showLoginForm()">Login</a>';
}

function showLoginForm() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('toggle-form').innerHTML = 'Not registered? <a href="#" onclick="showSignupForm()">Sign up</a>';
}

async function signup(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const result = await eel.signup(username, password)();
    alert(result);
    if (result === "Signup successful") {
        showLoginForm();
    }
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const result = await eel.login(username, password)();
    if (result.error) {
        alert(result.error);
    } else {
        localStorage.setItem('username', username);
        localStorage.setItem('key', result.key)
        showUserDashboard(username, result.workload);
    }
}

async function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('key');
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('employer-dashboard').style.display = 'none';
    document.getElementById('form-container').style.display = 'block';
    showLoginForm();
}

async function updateWorkload() {
    const username = localStorage.getItem('username');
    const key = localStorage.getItem('key');
    const workload = document.getElementById('workload').value;
    const result = await eel.update_workload(username, key, workload)();
    // update html
    document.getElementById('current_workload').innerText = workload;
    alert(result);
}

async function viewAllWorkloads(event) {
    event.preventDefault();
    showEmployerDashboard();
}

async function showUserDashboard(username, workload) {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('username').innerText = username;
    const current_workload = workload;
    document.getElementById('current_workload').innerText = current_workload;
    document.getElementById('workload').value = current_workload;
    document.getElementById('wl_label').innerText = `Current workload: ${current_workload}`;
    // add event listener to slider
    document.getElementById('workload').addEventListener('input', function () {
        document.getElementById('wl_label').innerText = `Current workload: ${this.value}`;
    });
}

let storedWorkloads = {};

async function getWorkloadsFromServer() {
    const employer_password = document.getElementById('employer-password').value;
    const workloads = await eel.employer_view_all(employer_password)();
    if (workloads !== "Invalid employer password") {
        storedWorkloads = workloads;
        return workloads;
    } else {
        alert(workloads);
        return {};
    }
}

function updateWorkloadList() {
    const sortBy = document.getElementById('sort-by').value;
    const filterRange = document.getElementById('filter-range').value;
    let workloads = Object.entries(storedWorkloads); // Convert object to array

    // Filter workloads
    if (filterRange !== 'all') {
        const [min, max] = filterRange.split('--').map(Number);
        workloads = workloads.filter(([name, value]) => value >= min && value <= max);
    }

    // Sort workloads
    workloads.sort((a, b) => {
        if (sortBy === 'name-asc') return a[0].localeCompare(b[0]);
        if (sortBy === 'name-desc') return b[0].localeCompare(a[0]);
        if (sortBy === 'workload-asc') return a[1] - b[1];
        if (sortBy === 'workload-desc') return b[1] - a[1];
    });

    // Update the DOM
    const workloadsContainer = document.getElementById('workloads');
    workloadsContainer.innerHTML = '';
    workloads.forEach(([name, value]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span><span>${value}</span>`;
        workloadsContainer.appendChild(li);
    });
}

async function showEmployerDashboard() {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('employer-dashboard').style.display = 'flex';
    await getWorkloadsFromServer();
    updateWorkloadList();
}

document.getElementById('sort-by').addEventListener('change', updateWorkloadList);
document.getElementById('filter-range').addEventListener('change', updateWorkloadList);