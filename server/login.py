import hashlib
import base64
import jwt
import datetime
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'
CORS(app)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

USER_DB_PATH = '/_cfg/user-db.json'  

def generate_hash(password):
    """Generate a hash from the password."""
    password_bytes = password.encode('utf-8')
    password_hash = hashlib.sha256(password_bytes).hexdigest()
    return password_hash

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

def load_users_from_file():
    """Load user data from a JSON file."""
    with open(USER_DB_PATH, 'r') as file:
        return json.load(file)

@app.route('/login', methods=['POST'])
def login():
    """Handle user login."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    logger.debug('Login attempt: username=%s', username)  

    if not username or not password:
        logger.warning('Username or password not provided')
        return jsonify({'message': 'Username and password are required'}), 400

    users = load_users_from_file()
    logger.debug('Loaded users from file: %s', users) 

    user = next((u for u in users if u['username'] == username), None)

    if user is None:
        logger.warning('User not found: %s', username)
        return jsonify({'message': 'User not found'}), 404

    input_password_hash = generate_hash(password)
    logger.debug('Generated hash for input password: %s', input_password_hash)  

    if input_password_hash != user['hashB64']:
        logger.warning('Invalid password for user: %s', username)
        return jsonify({'message': 'Invalid username or password'}), 401

    token = encode_token(user)
    logger.debug('Generated token for user: %s', user['username']) 

    return jsonify({
        'data': {
            'message': 'Login successful',
            'token': token,
            'user': {
                'userId': user['userId'],
                'username': user['username'],
                'rolename': user['rolename'],
                'rights': user['rights'],
                'expDate': user['expDate']
            }
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
