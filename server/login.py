import os
import hashlib
import base64
import requests
from flask import Flask, jsonify
from flask_cors import CORS
import logging
import jwt
import json

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = '1234'

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def encode_token(user_data):
    payload = {
        'userId': user_data['userId'],
        'username': user_data['username'],
        'rolename': user_data['rolename']
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/api/user/hash/<username_password_hash_b64>', methods=['GET'])
def get_user_by_hash(username_password_hash_b64):
    try:
        response = requests.get(f'https://localhost/api/user/hash/{username_password_hash_b64}', verify=False)
        response.raise_for_status()
        user_data = response.json()

        token = encode_token(user_data)
        return jsonify({
            'data': {
                'user': user_data,
                'token': token
            }
        }), 200

    except requests.RequestException as e:
        logger.error('Error fetching user data: %s', e)
        return jsonify({'message': 'User not found or error retrieving user data'}), 404

@app.route('/config', methods=['GET'])
def get_config():
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'RuntimeConfigDesc_en.json') 
        with open(config_path, 'r') as config_file:
            config_data = json.load(config_file)
        return jsonify(config_data), 200
    except FileNotFoundError:
        logger.error('Configuration file not found')
        return jsonify({'message': 'Configuration file not found'}), 404
    except json.JSONDecodeError:
        logger.error('Error decoding JSON from configuration file')
        return jsonify({'message': 'Error decoding JSON'}), 500


if __name__ == '__main__':
    app.run(debug=True)
