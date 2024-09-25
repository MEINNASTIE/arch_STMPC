# from flask import Flask, request, jsonify
# import datetime
# import jwt
# import pyotp
# from flask_cors import CORS

# app = Flask(__name__)
# app.config['SECRET_KEY'] = '1234'

# CORS(app)

# # Example storage (use a database in production)
# user_secrets = {}

# def encode_token(user_id):
#     payload = {
#         'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
#         'iat': datetime.datetime.utcnow(),
#         'sub': user_id
#     }
#     return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# @app.route('/api', methods=['GET'])
# def hello_world():
#     return jsonify({'message': 'Hello, World!'})

# @app.route('/api/generate_totp', methods=['GET'])
# def generate_totp():
#     username = request.args.get('username')
#     if username in user_secrets:
#         secret = user_secrets[username]
#         totp = pyotp.TOTP(secret)
#         return jsonify({'otp_url': totp.provisioning_uri(username, issuer_name='YourApp')})
#     return jsonify({'error': 'User not found'}), 404

# @app.route('/api/verify_totp', methods=['POST'])
# def verify_totp():
#     data = request.json
#     username = data.get('username')
#     otp = data.get('otp')

#     secret = user_secrets.get(username)
#     if not secret:
#         return jsonify({'error': 'Invalid user'}), 400

#     totp = pyotp.TOTP(secret)
#     if totp.verify(otp):
#         return jsonify({'message': 'OTP is valid'})
#     return jsonify({'error': 'Invalid OTP'}), 400

# @app.route('/api/login', methods=['POST'])
# def login():
#     print(f"Request method: {request.method}")
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')

#     if username == 'admin' and password == 'admin':
#         token = encode_token(username)
#         return jsonify({'token': token})

#     return jsonify({'message': 'Invalid credentials'}), 401

# @app.route('/api/protected', methods=['GET'])
# def protected():
#     token = request.headers.get('Authorization')
#     if not token:
#         return jsonify({'message': 'Token is missing!'}), 403

#     try:
#         token = token.split(" ")[1]
#         payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
#         return jsonify({'message': 'Protected content', 'user': payload['sub']})
#     except jwt.ExpiredSignatureError:
#         return jsonify({'message': 'Token has expired!'}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({'message': 'Invalid token!'}), 401

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
#     return response


# if __name__ == '__main__':
#     app.run(debug=True)

# simulation with a json and api 

import json
import os
import pyotp
import requests
import jwt
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'
CORS(app)

USE_JSON_FILE = True  # Set to False when using actual API in production
JSON_FILE = 'user-db.json'
API_BASE_URL = "http://your-api-server.com/api/user" 

def load_users():
    if not os.path.exists(JSON_FILE):
        return []
    with open(JSON_FILE, 'r') as file:
        return json.load(file)

def save_users(users):
    with open(JSON_FILE, 'w') as file:
        json.dump(users, file, indent=4)

def get_user_from_file(username):
    users = load_users()
    for user in users:
        if user['username'] == username:
            return user
    return None

def get_user_from_api(username):
    response = requests.get(f"{API_BASE_URL}/{username}")
    if response.status_code == 200:
        return response.json()
    return None

def get_user(username):
    if USE_JSON_FILE:
        return get_user_from_file(username)
    return get_user_from_api(username)

def update_user_totp_secret_in_file(username, secret):
    users = load_users()
    for user in users:
        if user['username'] == username:
            user['totp_secret'] = secret
            save_users(users)
            return True
    return False

def update_user_totp_secret_in_api(username, secret):
    payload = {'totp_secret': secret}
    response = requests.post(f"{API_BASE_URL}/{username}", json=payload)
    return response.status_code == 200

def update_user_totp_secret(username, secret):
    if USE_JSON_FILE:
        return update_user_totp_secret_in_file(username, secret)
    return update_user_totp_secret_in_api(username, secret)

@app.route('/api', methods=['GET'])
def hello_world():
   return jsonify({'message': 'Hello, World!'})

@app.route('/api/generate_totp', methods=['GET'])
def generate_totp():
    username = request.args.get('username')
    user_data = get_user(username)
    
    if user_data:
        secret = user_data.get('totp_secret')
        
        if not secret:
            secret = pyotp.random_base32()
            update_user_totp_secret(username, secret)
        
        totp = pyotp.TOTP(secret)
        otp_url = totp.provisioning_uri(username, issuer_name='YourApp')
        return jsonify({'otp_url': otp_url})
    
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/verify_totp', methods=['POST'])
def verify_totp():
    data = request.json
    username = data.get('username')
    otp = data.get('otp')
    user_data = get_user(username)
    
    if not user_data:
        return jsonify({'error': 'Invalid user'}), 400

    secret = user_data.get('totp_secret')
    if not secret:
        return jsonify({'error': 'User does not have a TOTP secret'}), 400

    totp = pyotp.TOTP(secret)
    if totp.verify(otp):
        return jsonify({'message': 'OTP is valid'})
    return jsonify({'error': 'Invalid OTP'}), 400

def encode_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # if username == 'admin' and password == 'admin':
    #     token = encode_token(username)
    #     return jsonify({'token': token})

    # return jsonify({'message': 'Invalid credentials'}), 401

    users = load_users() 

    user = next((user for user in users if user['username'] == username), None)

    if user and user.get('hashB64') == password: 
        token = encode_token(user['id'])  
        return jsonify({'token': token})

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 403

    try:
        token = token.split(" ")[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({'message': 'Protected content', 'user': payload['sub']})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token!'}), 401

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)
