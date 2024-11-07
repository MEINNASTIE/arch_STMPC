import os
import requests
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
import json
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, supports_credentials=True)

SECRET_KEY = 'Lain4Ever'

def generate_jwt(userId):
    """Generate JWT with user data and expiration."""
    payload = {
        'userId': userId,  
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token  

@app.route('/api/user/hash/<username_password_hash_b64>', methods=['GET'])
def get_user_by_hash(username_password_hash_b64):
    try:
        response = requests.get(f'https://localhost/api/user/hash/{username_password_hash_b64}', verify=False)
        response.raise_for_status()
        
        user_data = response.json()
        
        if 'payload' not in user_data:
            return jsonify({'message': 'Payload not found in response'}), 404

        # user_data = {
        #     "payload": {
        #         "userId": "4698202e-7777-4f5b-9a96-180d3bf2fc9b",
        #         "username": "admin",
        #         "enabled": 1,
        #         "expDate": "2999-01-01T00:00:00+01:00",
        #         "rolename": "admin",
        #         "rights": {
        #             "system_time": "rwx",
        #             "api/config/user": "rw",
        #             "api/config/system": "rw"
        #         }
        #     }
        # }

        user_id = user_data['payload']['userId']
        
        token = generate_jwt(user_id)
        resp = make_response(jsonify({
            'data': {'user': user_data['payload'],  
        }}), 200)
        resp.set_cookie('token', token, httponly=True, samesite='None', path='/', secure=True)

        return resp

    except requests.RequestException as e:
        print(f'Error fetching user data: {e}')
        return jsonify({'message': 'User not found or error retrieving user data'}), 404

@app.route('/config', methods=['GET'])
def get_config():
    config_path = os.path.join(os.path.dirname(__file__), 'RuntimeConfigDesc_en.json')
    try:
        with open(config_path, 'r') as config_file:
            config_data = json.load(config_file)
        return jsonify(config_data), 200
    except FileNotFoundError:
        print('Configuration file not found')
        return jsonify({'message': 'Configuration file not found'}), 404
    except json.JSONDecodeError:
        print('Error decoding JSON from configuration file')
        return jsonify({'message': 'Error decoding JSON'}), 500

@app.route('/verify-token', methods=['GET'])
def verify_token():
    """Endpoint to verify JWT token from cookies."""
    token = request.cookies.get('token')
    if not token:
        print('Token is missing')
        return jsonify({'message': 'Token is missing'}), 401

    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return jsonify({'message': 'Token is valid', 'user_id': decoded_token['userId']}), 200
    except jwt.ExpiredSignatureError:
        print('Token has expired')
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        print('Invalid token')
        return jsonify({'message': 'Invalid token'}), 401

if __name__ == '__main__':
    app.run(debug=True)
