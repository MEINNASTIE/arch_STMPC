import os
import hashlib
import base64
import jwt
import datetime
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'
CORS(app)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

API_URL = 'https://localhost/api/users/count'

def encode_token(user_data):
    """Generate a JWT token for a user, including additional user data."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_data['userId'],
        'username': user_data['username'],
        'rolename': user_data['rolename'],
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def fetch_users_from_api():
    """Fetch users from the external API."""
    try:
        response = requests.get(API_URL, verify=False) 
        response.raise_for_status() 
        return response.json()
    except requests.RequestException as e:
        logger.error('Error fetching users from API: %s', e)
        return None

@app.route('/login', methods=['POST'])
def login():
    """Handle user login."""
    data = request.json
    username = data.get('username')

    logger.debug('Login attempt: username=%s', username)

    if not username:
        logger.warning('Username not provided')
        return jsonify({'message': 'Username is required'}), 400

    api_response = fetch_users_from_api()
    if api_response is None or 'payload' not in api_response:
        logger.warning('Failed to retrieve users from the API')
        return jsonify({'message': 'Unable to authenticate at this time'}), 500

    users = api_response['payload']
    logger.debug('Loaded users from API: %s', users)

    user = next((u for u in users if u['username'] == username), None)

    if user is None:
        logger.warning('User not found: %s', username)
        return jsonify({'message': 'User not found'}), 404

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
                'expDate': user['expDate']
            }
        }
    }), 200


if __name__ == '__main__':
    app.run(debug=True)
