import json
import pyotp
import requests
import jwt
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import hashlib

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'

CORS(app, resources={r"/api/*": {"origins": "http://localhost"}})

API_BASE_URL = "https://localhost/api" 

# to generate hash password for the user
def generate_hash(username, password):
    """Generate a base64-encoded hash from the username and password."""
    hash_input = f"{username};{password}".encode('utf-8')
    hash_digest = hashlib.sha256(hash_input).digest()
    hash_b64 = base64.b64encode(hash_digest).decode('utf-8')
    return hash_b64

# getting user from username
def get_user_from_api(username):
    print(f"Fetching user: {username}")  
    response = requests.get(f"{API_BASE_URL}/user/{username}")
    if response.status_code == 200:
        user = response.json()
        print(f"User data fetched: {user}")  
        return user
    print(f"User {username} not found.")
    return None

# updating user totp secret
def update_user_totp_secret_in_api(username, secret):
    print(f"Updating TOTP secret for {username}")
    payload = {'totp_secret': secret}
    response = requests.post(f"{API_BASE_URL}/user/{username}", json=payload)
    return response.status_code == 200

# create initial admin user
def create_initial_admin(username, password):
    """ Create the initial admin user via the external user management server. """
    print(f"Creating initial admin user: {username}")
    username_password_hash = generate_hash(username, password)

    payload = {
        "hash": username_password_hash
    }

    response = requests.post(f"{API_BASE_URL}/user/initadmin", json=payload)
    if response.status_code == 201:
        print(f"Admin user {username} created successfully.")
        return response.json() 
    print(f"Failed to create admin user: {response.json()}")
    return None

# check admin user
def admin_exists():
    """Check if an admin user already exists."""
    response = requests.get(f"{API_BASE_URL}/users")  
    if response.status_code == 200:
        users = response.json()
        for user in users:
            if user.get('rolename') == 'admin':  
                return True
    return False

# for user count
@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    """Get user count and check for admin existence."""
    admin_exist = admin_exists()
    response = requests.get(f"{API_BASE_URL}/users")
    if response.status_code == 200:
        users = response.json()
        print(f"User count fetched: {len(users)} users (Admin exists: {admin_exist})")  
        return jsonify({'count': len(users), 'admin_exists': admin_exist})
    return jsonify({'message': 'Error fetching users'}), 500

# for getting all users
@app.route('/api/users', methods=['GET'])
def get_all_users():
    response = requests.get(f"{API_BASE_URL}/users")
    if response.status_code == 200:
        users = response.json()
        print(f"Fetched users: {users}")  
        return jsonify(users)
    return jsonify([])

# identify a user
@app.route('/api/user/<identifier_type>/<identifier>', methods=['GET'])
def get_user_details(identifier_type, identifier):
    print(f"Fetching user by {identifier_type}: {identifier}")
    response = requests.get(f"{API_BASE_URL}/user/{identifier_type}/{identifier}")
    if response.status_code == 200:
        user = response.json()
        print(f"User details fetched: {user}") 
        return jsonify(user)
    return jsonify({'message': 'User not found'}), 404

# to generate totp
@app.route('/api/generate_totp', methods=['GET'])
def generate_totp():
    username = request.args.get('username')
    user_data = get_user_from_api(username)
    
    if user_data:
        user_id = user_data['id']
        secret = user_data.get('totp_secret')
        
        if not secret:
            secret = pyotp.random_base32()
            update_user_totp_secret_in_api(username, secret)
        
        totp = pyotp.TOTP(secret)
        otp_url = totp.provisioning_uri(user_id, issuer_name='YourApp')
        return jsonify({'otp_url': otp_url})
    
    return jsonify({'error': 'User not found'}), 404

# to verify totp
@app.route('/api/verify_totp', methods=['POST'])
def verify_totp():
    data = request.json
    username = data.get('username')
    otp = data.get('otp')
    user_data = get_user_from_api(username)
    
    if not user_data:
        return jsonify({'error': 'Invalid user'}), 400

    secret = user_data.get('totp_secret')
    if not secret:
        return jsonify({'error': 'User does not have a TOTP secret'}), 400

    totp = pyotp.TOTP(secret)
    if totp.verify(otp):
        return jsonify({'message': 'OTP is valid'})
    return jsonify({'error': 'Invalid OTP'}), 400

# encoding token for a user
def encode_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# login endpoint
# @app.route('/login', methods=['POST'])
# def login():
#     try:
#         data = request.json
#         username = data.get('username')
#         password = data.get('password')

#         if not username or not password:
#             return jsonify({'message': 'Username and password are required'}), 400

#         print(f"Login attempt by user: {username}")

#         hash_b64 = generate_hash(username, password)

#         if not admin_exists():
#             return create_initial_admin(username, password)

#         response = requests.get(f"{API_BASE_URL}/user/hash/{username}")

#         if response.status_code == 200:
#             user = response.json()
#             stored_hash_b64 = user.get('hashB64')

#             if stored_hash_b64 and stored_hash_b64 == hash_b64:
#                 token = encode_token(user['id'])
#                 print(f"Login successful for user: {username}")
#                 return jsonify({'token': token})

#         print(f"Login failed for user: {username}")
#         return jsonify({'message': 'Invalid credentials'}), 401

#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({'message': 'Internal Server Error'}), 500


# a protected endpoint
@app.route('/api/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 403

    try:
        token = token.split(" ")[1] 
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        print(f"Access granted to user: {payload['sub']}") 
        return jsonify({'message': 'Protected content', 'user': payload['sub']})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token!'}), 401

# initializing admin user
def init_user(username, password):
    user_pass = f"{username};{password}"
    
    hashB64 = base64.b64encode(user_pass.encode()).decode()

    url = f"https://localhost/api/user/initadmin?hash={hashB64}"
    
    try:
        response = requests.post(url, verify=False)

        if response.status_code == 200:
            payload = response.json()
            return payload
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
        
user_payload = init_user('some_user', 'some_password')

if user_payload:
    print("User initialization successful:")
    print(user_payload)

# creating a user   
@app.route('/api/user', methods=['POST'])
def create_user():
    """Create a new user."""
    data = request.json
    username = data.get('username')
    rolename = data.get('rolename')
    password = data.get('password')
    exp_date = data.get('expDate', '2999-01-01')  
    enabled = data.get('enabled', 1)

    if not username or not password or not rolename:
        return jsonify({'error': 'Username, password, and rolename are required.'}), 400

    username_password_hash = generate_hash(username, password)

    payload = {
        'username': username,
        'rolename': rolename,
        'hash': username_password_hash,
        'expDate': exp_date,
        'enabled': enabled
    }

    response = requests.post(f"{API_BASE_URL}/user", json=payload)

    if response.status_code == 201:
        return jsonify(response.json()), 201  
    else:
        return jsonify({'error': 'Failed to create user'}), response.status_code

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
#     return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

