import eel
import json
import os
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64

# Initialize Eel
eel.init('web')

# Load or initialize data
if not os.path.exists('data.json'):
    with open('data.json', 'w') as f:
        json.dump({"usernames": [], "workloads": {}}, f)


def load_data():
    with open('data.json', 'r') as f:
        return json.load(f)


def save_data(data):
    with open('data.json', 'w') as f:
        json.dump(data, f)


# Encryption and decryption functions
def generate_key(password, salt):
    kdf = Scrypt(salt=salt, length=32, n=2 ** 14, r=8, p=1, backend=default_backend())
    return kdf.derive(password.encode())


def encrypt_data(data, key):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(data.encode()) + encryptor.finalize()
    return base64.b64encode(iv + encrypted_data).decode()


def decrypt_data(encrypted_data, key):
    encrypted_data = base64.b64decode(encrypted_data)
    iv = encrypted_data[:16]
    cipher = Cipher(algorithms.AES(key), modes.CFB(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    try:
        return (decryptor.update(encrypted_data[16:]) + decryptor.finalize()).decode()
    except UnicodeDecodeError:
        return False

def encrypt_key_rsa(data, public_key):
    encrypted_data = public_key.encrypt(
        data,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return encrypted_data

def decrypt_key_rsa(data, private_key):
    return private_key.decrypt(
        data,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )


# Load employer keys from files
def load_employer_pub_key():
    with open('employer_key_pub.pem', 'rb') as key_file:
        public_key = serialization.load_pem_public_key(
            key_file.read(),
            backend=default_backend()
        )
    return public_key


def load_employer_priv_key(employer_password):
    with open('employer_key', 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=employer_password.encode(),
            backend=default_backend()
        )
    return private_key


# User management functions
@eel.expose
def signup(username, password):
    data = load_data()
    if username in data['usernames']:
        return "Username already exists"
    salt = os.urandom(16)
    key = generate_key(password, salt)
    encrypted_key = encrypt_key_rsa(key, load_employer_pub_key())
    default_workload = "workload:N/A"
    encrypted_workload = encrypt_data(default_workload, key)
    data['usernames'].append(username)
    data['workloads'][username] = {
        "salt": base64.b64encode(salt).decode(),
        "key": base64.b64encode(encrypted_key).decode(),
        "workload": encrypted_workload
    }
    save_data(data)
    return "Signup successful"


@eel.expose
def login(username, password):
    data = load_data()
    if username not in data['usernames']:
        return {"error": "Username not found"}
    user_data = data['workloads'][username]
    salt = base64.b64decode(user_data['salt'])
    key = generate_key(password, salt)
    key_str = key.hex()
    user_workload = decrypt_data(user_data['workload'], key)
    if not user_workload:
        return {"error": "Invalid password"}
    return {"username": username, "workload": user_workload.split(":")[1], "key": key_str}


@eel.expose
def update_workload(username, key, workload):
    key = bytes.fromhex(key)
    workload = "workload:" + workload
    data = load_data()
    user_data = data['workloads'][username]
    encrypted_workload = encrypt_data(workload, key)
    user_data['workload'] = encrypted_workload
    save_data(data)
    return "Workload updated"


@eel.expose
def get_workload(username, password):
    data = load_data()
    user_data = data['workloads'][username]
    salt = base64.b64decode(user_data['salt'])
    key = generate_key(password, salt)
    encrypted_workload = user_data['workload']
    return decrypt_data(encrypted_workload, key).split(":")[1]


@eel.expose
def employer_view_all(employer_password):
    try:
        employer_private_key = load_employer_priv_key(employer_password)
    except ValueError:
        return "Invalid employer password"

    data = load_data()
    all_workloads = {}
    for username, user_data in data['workloads'].items():
        encrypted_key = user_data['key']
        key = decrypt_key_rsa(base64.b64decode(encrypted_key), employer_private_key)
        workload = decrypt_data(user_data['workload'], key).split(":")[1]
        all_workloads[username] = workload
    return all_workloads


# Start Eel
eel.start('index.html', size=(800, 600))
