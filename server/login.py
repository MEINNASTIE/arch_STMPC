import json
import requests
import hashlib
import base64
import jwt
from flask import Flask, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'

API_BASE_URL = "https://localhost/login" 

# only for testing 
@app.route('/hello', methods=['GET'])
def hello_world():
     return jsonify({'message': 'Lain is forever!'})

# to generate hash password for the user
def generate_hash(username, password):
    """Generate a base64-encoded hash from the username and password."""
    hash_input = f"{username};{password}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).digest()
    hash_b64 = base64.b64encode(hash_digest).decode('utf-8')
    return hash_b64

# encoding token for a user
def encode_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    print(f"Login attempt by user: {username}")

    hash_b64 = generate_hash(username, password)

    # Check if admin exists in the main server
    response = requests.get(f"{API_BASE_URL}/user/hash/{username}")

    if response.status_code == 200:
        user = response.json()
        stored_hash_b64 = user.get('hashB64')

        if stored_hash_b64 and stored_hash_b64 == hash_b64:
            token = encode_token(user['id'])
            print(f"Login successful for user: {username}")
            return jsonify({'token': token})

    print(f"Login failed for user: {username}")
    return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
