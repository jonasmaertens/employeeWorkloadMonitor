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
    const employer_password = document.getElementById('employer-password').value;
    const workloads = await eel.employer_view_all(employer_password)();
    if (workloads !== "Invalid employer password") {
        showEmployerDashboard(workloads);
    } else {
        alert(workloads);
    }
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
    document.getElementById('workload').addEventListener('input', function() {
        document.getElementById('wl_label').innerText = `Current workload: ${this.value}`;
    });
}

function showEmployerDashboard(workloads) {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('employer-dashboard').style.display = 'flex';
    const workloadsDiv = document.getElementById('workloads');
    workloadsDiv.innerHTML = JSON.stringify(workloads, null, 2);
}