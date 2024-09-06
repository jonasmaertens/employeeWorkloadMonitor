# Employee Workload Monitor

## Description
A web-based application to monitor and manage employee workloads. The application is designed for a context where all users have access to the data file/database, and it should be secure. To ensure security, the application uses a combination of symmetric and asymmetric encryption. A privileged user (employer) has access to all data, which is why both types of encryption are used. The backend is a Python application that uses Eel to temporarily host a web frontend.

## Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/jonasmaertens/employeeWorkloadMonitor.git
    cd employeeWorkloadMonitor
    ```

2. **Create a virtual environment**:
    ```sh
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3. **Install dependencies**:
    ```sh
    pip install -r requirements.txt
    ```

4. **Generate RSA key pair**:
    ```sh
    ssh-keygen -t rsa -b 2048 -m PEM -f employer_key -N "your_password"
    ssh-keygen -f employer_key.pub -e -m PEM > employer_key_pub.pem
    ```

## Usage

1. **Start the application**:
    ```sh
    python main.py
    ```

2. **Access the web interface**:
    The web browser window should open automatically.

## License
This project is licensed under the MIT License.