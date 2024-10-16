import json
import hashlib
import base64
import jwt
import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'

# important to note, this will be different for production 
USER_DB_FILE = '/home/meinna/mpcapp/_cfg/user-db.json'  

def load_users():
    """Load users from the JSON file."""
    with open(USER_DB_FILE, 'r') as file:
        return json.load(file)

def find_user_by_username(username):
    """Find a user in the JSON file by their username."""
    users = load_users()
    for user in users:
        if user['username'] == username:
            return user
    return None

def generate_hash_b64(username, password):
    """Generate a base64-encoded hash from the username and password."""
    hash_input = f"{username};{password}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).digest()
    hash_b64 = base64.b64encode(hash_digest).decode('utf-8')
    return hash_b64

def encode_token(user_id):
    """Generate a JWT token for a user."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),  
        'iat': datetime.datetime.utcnow(),  
        'sub': user_id 
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/hello', methods=['GET'])
def hello_world():
    return jsonify({'message': 'Lain is forever!'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    print(f"Received login attempt for username: {username}")

    if not username or not password:
        print("Login failed: Username or password not provided")
        return jsonify({'message': 'Username and password are required'}), 400

    user = find_user_by_username(username)
    if not user:
        print("Login failed: User not found")
        return jsonify({'message': 'Invalid username or password'}), 401

    input_hash_b64 = generate_hash_b64(username, password)
    # print(f"Generated hash for comparison: {input_hash_b64}")
    # print(f"Stored hash in database: {user['hashB64']}")

    if user['hashB64'] == input_hash_b64 and user['enabled'] == 1:
        print("Login successful: Passwords match")
        token = encode_token(user['userId'])
        return jsonify({'message': 'Login successful', 'token': token}), 200
    else:
        print("Login failed: Invalid password or user is not enabled")
        return jsonify({'message': 'Invalid username or password'}), 401


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
