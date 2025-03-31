import os
import json
import pyotp
import requests
import jwt
import datetime
import base64
import hashlib
from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '1234')
CORS(app, supports_credentials=True)

API_BASE_URL = "/api"  

# Utility to construct the full URL
def get_full_api_url(relative_url):
    scheme = request.scheme  
    host = request.host  
    return f"{scheme}://{host}{relative_url}"

# Utilities

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET'])
def serve_frontend_path(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')
  
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
    full_url = get_full_api_url(f"{API_BASE_URL}/user/{username}")
    response = requests.get(full_url, verify=False)
    if response.status_code == 200:
        return response.json()
    return None

def update_user_totp_secret_in_api(username, secret):
    payload = {'totp_secret': secret}
    full_url = get_full_api_url(f"{API_BASE_URL}/user/{username}")
    response = requests.post(full_url, json=payload, verify=False)
    return response.status_code == 200

def admin_exists():
    full_url = get_full_api_url(f"{API_BASE_URL}/users")
    response = requests.get(full_url, verify=False)
    if response.status_code == 200:
        users = response.json()
        return any(user.get('rolename') == 'admin' for user in users)
    return False

def init_user(username, password):
    hash_b64 = generate_hash(username, password)
    full_url = get_full_api_url(f"{API_BASE_URL}/user/initadmin?hash={hash_b64}")
    try:
        response = requests.post(full_url, verify=False)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"An error occurred: {e}")
    return None

# Routes

@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    full_url = get_full_api_url(f"{API_BASE_URL}/users")
    response = requests.get(full_url, verify=False)
    if response.status_code == 200:
        users = response.json()
        return jsonify({'count': len(users), 'admin_exists': admin_exists()})
    return jsonify({'message': 'Error fetching users'}), 500

@app.route('/api/user/hash/<username_password_hash_b64>', methods=['GET'])
def get_user_by_hash(username_password_hash_b64):
    full_url = get_full_api_url(f"{API_BASE_URL}/user/hash/{username_password_hash_b64}")
    response = requests.get(full_url, verify=False)
    if response.status_code == 200:
        user_data = response.json()
        user_id = user_data.get('payload', {}).get('userId')
        if user_id:
            user_data['token'] = generate_jwt(user_id)
            return jsonify(user_data)
    return jsonify({'message': 'User not found or error retrieving user data'}), 404

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

@app.route('/token', methods=['POST'])
def generate_token():
    data = request.get_json()
    user_id = data.get('userId')
    allow_api = data.get('allowApi', False)

    if not user_id:
        return jsonify({'message': 'Missing userId'}), 400

    payload = {
        'sub': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'allow_api': allow_api
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token}), 200


# to make sure that the API is only accessible to users with a valid token
@app.before_request
def check_api_access():
    if not request.path.startswith('/api'):
        return
    
    public_routes = ['']
    if request.path in public_routes:
        return

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Access denied: No token provided'}), 403

    try:
        token = token.split()[1] if token.startswith('Bearer ') else token
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])

        if not decoded_token.get('allow_api', False):
            return jsonify({'message': 'Access denied: API access not allowed'}), 403
        request.user = decoded_token
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)