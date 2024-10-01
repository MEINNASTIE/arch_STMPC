import json
import pyotp
import requests
import jwt
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'
CORS(app)

API_BASE_URL = "http://127.0.0.1:8005/api" 

def get_user_from_api(username):
    print(f"Fetching user: {username}")  
    response = requests.get(f"{API_BASE_URL}/user/{username}")
    if response.status_code == 200:
        user = response.json()
        print(f"User data fetched: {user}")  
        return user
    print(f"User {username} not found.")
    return None

def update_user_totp_secret_in_api(username, secret):
    print(f"Updating TOTP secret for {username}")
    payload = {'totp_secret': secret}
    response = requests.post(f"{API_BASE_URL}/user/{username}", json=payload)
    return response.status_code == 200

@app.route('/api', methods=['GET'])
def hello_world():
    return jsonify({'message': 'Lain is forever!'})

@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    response = requests.get(f"{API_BASE_URL}/users")
    if response.status_code == 200:
        users = response.json()
        print(f"User count fetched: {len(users)} users")  
        return jsonify({'count': len(users)})
    return jsonify({'message': 'Error fetching users'}), 500

@app.route('/api/users', methods=['GET'])
def get_all_users():
    response = requests.get(f"{API_BASE_URL}/users")
    if response.status_code == 200:
        users = response.json()
        print(f"Fetched users: {users}")  
        return jsonify(users)
    return jsonify([])

@app.route('/api/user/<identifier_type>/<identifier>', methods=['GET'])
def get_user_details(identifier_type, identifier):
    print(f"Fetching user by {identifier_type}: {identifier}")
    response = requests.get(f"{API_BASE_URL}/user/{identifier_type}/{identifier}")
    if response.status_code == 200:
        user = response.json()
        print(f"User details fetched: {user}") 
        return jsonify(user)
    return jsonify({'message': 'User not found'}), 404

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

    print(f"Login attempt by user: {username}") 

    response = requests.get(f"{API_BASE_URL}/user/{username}")
    if response.status_code == 200:
        user = response.json()
        if user.get('hashB64') == password:
            token = encode_token(user['id'])
            print(f"Login successful for user: {username}") 
            return jsonify({'token': token})

    print(f"Login failed for user: {username}") 
    return jsonify({'message': 'Invalid credentials'}), 401

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

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=False)
