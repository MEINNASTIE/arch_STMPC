import json
import hashlib
import base64
import jwt
import datetime
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'  
CORS(app)

USER_API_URL = 'https://localhost/api/user/hash/'

def fetch_user_data_from_api(username):
    """Fetch user data from the external API."""
    try:
        response = requests.get(f"{USER_API_URL}{username}")
        if response.status_code == 200:
            data = response.json()
            if 'payload' in data:
                return data['payload']
            return None
        return None
    except requests.RequestException:
        return None

def generate_hash_b64(username, password):
    """Generate a base64-encoded hash from the username and password."""
    hash_input = f"{username};{password}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).digest()
    hash_b64 = base64.b64encode(hash_digest).decode('utf-8')
    return hash_b64

def encode_token(user_data):
    """Generate a JWT token for a user, including additional user data."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_data['userId'],
        'username': user_data['username'],
        'rolename': user_data['rolename'],
        'rights': user_data['rights']
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/login', methods=['POST'])
def login():
    """Handle user login."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    app.logger.info(f"Login attempt for username: {username}")

    if not username or not password:
        app.logger.warning("Username and password are required.")
        return jsonify({'message': 'Username and password are required'}), 400

    user_data = fetch_user_data_from_api(username)
    
    if not user_data:
        app.logger.warning(f"User data not found for username: {username}")
        return jsonify({'message': 'Invalid username or password'}), 401

    if 'hash' not in user_data:
        app.logger.warning("User data does not contain hash.")
        return jsonify({'message': 'Invalid username or password'}), 401

    stored_hash_b64 = user_data['hash']
    input_hash_b64 = generate_hash_b64(username, password)

    app.logger.info(f"Comparing stored hash: {stored_hash_b64} with input hash: {input_hash_b64}")

    if stored_hash_b64 == input_hash_b64:
        if user_data.get('enabled') == 1:
            token = encode_token(user_data)
            return jsonify({
                'data': {
                    'message': 'Login successful',
                    'token': token,
                    'user': {
                        'userId': user_data['userId'],
                        'username': user_data['username'],
                        'rolename': user_data['rolename'],
                        'rights': user_data['rights'],
                        'expDate': user_data['expDate']
                    }
                }
            }), 200
        else:
            app.logger.warning("User is not enabled.")
            return jsonify({'message': 'User is not enabled'}), 403
    else:
        app.logger.warning("Invalid username or password after hash comparison.")
        return jsonify({'message': 'Invalid username or password'}), 401


if __name__ == '__main__':
    app.run(debug=True)
