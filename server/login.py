import json
import hashlib
import base64
import jwt
import datetime
import requests
import logging
from flask import Flask, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'

# Production wise?
USER_API_URL = 'https://localhost/api/user/hash/'

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/meinna/login.log'),  
        logging.StreamHandler()  
    ]
)

def fetch_user_data_from_api(username):
    """Fetch the user data from the external API."""
    try:
        response = requests.get(f"{USER_API_URL}{username}")
        logging.info(f"API Response: {response.text}") 
        if response.status_code == 200:
            data = response.json()
            if 'payload' in data:
                return data['payload']
            else:
                logging.warning("Payload not found in the response")
                return None
        else:
            logging.error(f"Failed to fetch user data: {response.status_code}")
            return None
    except requests.RequestException as e:
        logging.exception("Exception occurred while fetching user data")
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

@app.route('/hello', methods=['GET'])
def hello_world():
    return jsonify({'message': 'Lain is forever!'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    logging.info(f"Received login attempt for username: {username}")

    if not username or not password:
        logging.warning("Login failed: Username or password not provided")
        return jsonify({'message': 'Username and password are required'}), 400

    user_data = fetch_user_data_from_api(username)
    if not user_data or 'hash' not in user_data:
        logging.warning("Login failed: User data not found or hash missing")
        return jsonify({'message': 'Invalid username or password'}), 401

    stored_hash_b64 = user_data['hash']
    input_hash_b64 = generate_hash_b64(username, password)

    logging.debug(f"Stored hash: {stored_hash_b64}, Input hash: {input_hash_b64}")

    if stored_hash_b64 == input_hash_b64 and user_data.get('enabled') == 1:
        logging.info("Login successful: Passwords match")
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
        logging.warning("Login failed: Invalid password or user is not enabled")
        return jsonify({'message': 'Invalid username or password'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
