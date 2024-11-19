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

        user_id = user_data['payload']['userId']
        token = generate_jwt(user_id)

        user_data['token'] = token  
        return jsonify(user_data), 200

    except requests.RequestException:
        return jsonify({'message': 'User not found or error retrieving user data'}), 404

@app.route('/config', methods=['GET'])
def get_config():
    config_path = os.path.join(os.path.dirname(__file__), 'RuntimeConfigDesc_en.json')
    try:
        with open(config_path, 'r') as config_file:
            config_data = json.load(config_file)
        return jsonify(config_data), 200
    except FileNotFoundError:
        return jsonify({'message': 'Configuration file not found'}), 404
    except json.JSONDecodeError:
        return jsonify({'message': 'Error decoding JSON'}), 500

@app.route('/token', methods=['POST'])
def generate_token():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'message': 'Missing userId'}), 400
        
        token = generate_jwt(user_id)
        
        return jsonify({'token': token}), 200

    except Exception:
        return jsonify({'message': 'Error generating token'}), 500

@app.route('/verify-token', methods=['GET'])
def verify_token():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'message': 'Token is missing'}), 401

    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return jsonify({'message': 'Token is valid', 'user_id': decoded_token['userId']}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

if __name__ == '__main__':
    app.run(debug=True)
