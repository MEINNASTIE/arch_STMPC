import os
import json
import pyotp
import requests
import jwt
import datetime
import base64
import hashlib
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '1234')
CORS(app, resources={r"/api/*": {"origins": "http://localhost"}}, supports_credentials=True)

API_BASE_URL = "https://localhost/api"  

# Utilities

def generate_hash(username, password):
    hash_input = f"{username};{password}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).digest()
    return base64.b64encode(hash_digest).decode('utf-8')

def generate_jwt(user_id):
    payload = {
        'sub': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def get_user_from_api(username):
    response = requests.get(f"{API_BASE_URL}/user/{username}", verify=False)
    if response.status_code == 200:
        return response.json()
    return None

def update_user_totp_secret_in_api(username, secret):
    payload = {'totp_secret': secret}
    response = requests.post(f"{API_BASE_URL}/user/{username}", json=payload, verify=False)
    return response.status_code == 200

def admin_exists():
    response = requests.get(f"{API_BASE_URL}/users", verify=False)
    if response.status_code == 200:
        users = response.json()
        return any(user.get('rolename') == 'admin' for user in users)
    return False

def init_user(username, password):
    hash_b64 = generate_hash(username, password)
    url = f"{API_BASE_URL}/user/initadmin?hash={hash_b64}"
    try:
        response = requests.post(url, verify=False)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"An error occurred: {e}")
    return None

# Routes

@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    response = requests.get(f"{API_BASE_URL}/users", verify=False)
    if response.status_code == 200:
        users = response.json()
        return jsonify({'count': len(users), 'admin_exists': admin_exists()})
    return jsonify({'message': 'Error fetching users'}), 500

@app.route('/api/user/hash/<username_password_hash_b64>', methods=['GET'])
def get_user_by_hash(username_password_hash_b64):
    response = requests.get(f"{API_BASE_URL}/user/hash/{username_password_hash_b64}", verify=False)
    if response.status_code == 200:
        user_data = response.json()
        user_id = user_data.get('payload', {}).get('userId')
        if user_id:
            user_data['token'] = generate_jwt(user_id)
            return jsonify(user_data)
    return jsonify({'message': 'User not found or error retrieving user data'}), 404

@app.route('/generate_totp', methods=['GET'])
def generate_totp():
    username = request.args.get('username')
    user_data = get_user_from_api(username)
    if user_data:
        secret = user_data.get('totp_secret') or pyotp.random_base32()
        if not user_data.get('totp_secret'):
            update_user_totp_secret_in_api(username, secret)
        totp = pyotp.TOTP(secret)
        otp_url = totp.provisioning_uri(user_data['id'], issuer_name='YourApp')
        return jsonify({'otp_url': otp_url})
    return jsonify({'error': 'User not found'}), 404

@app.route('/verify_totp', methods=['POST'])
def verify_totp():
    data = request.json
    username, otp = data.get('username'), data.get('otp')
    user_data = get_user_from_api(username)
    if user_data:
        totp = pyotp.TOTP(user_data.get('totp_secret', ''))
        if totp.verify(otp):
            return jsonify({'message': 'OTP is valid'})
    return jsonify({'error': 'Invalid OTP'}), 400

@app.route('/api/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 403
    try:
        payload = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({'message': 'Protected content', 'user': payload['sub']})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token!'}), 401

@app.route('/api/user', methods=['POST'])
def create_user():
    data = request.json
    username, rolename, password = data.get('username'), data.get('rolename'), data.get('password')
    if not all([username, password, rolename]):
        return jsonify({'error': 'Username, password, and rolename are required.'}), 400
    payload = {
        'username': username,
        'rolename': rolename,
        'hash': generate_hash(username, password),
        'expDate': data.get('expDate', '2999-01-01'),
        'enabled': data.get('enabled', 1)
    }
    response = requests.post(f"{API_BASE_URL}/user", json=payload, verify=False)
    if response.status_code == 201:
        return jsonify(response.json()), 201
    return jsonify({'error': 'Failed to create user'}), response.status_code

@app.route('/token', methods=['POST'])
def generate_token():
    data = request.get_json()
    user_id = data.get('userId')
    if not user_id:
        return jsonify({'message': 'Missing userId'}), 400
    return jsonify({'token': generate_jwt(user_id)}), 200

@app.route('/verify-token', methods=['GET'])
def verify_token():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'message': 'Token is missing'}), 401
    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({'message': 'Token is valid', 'user_id': decoded_token['sub']}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
