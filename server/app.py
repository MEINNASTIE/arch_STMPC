from flask import Flask, request, jsonify
import datetime
import jwt
import pyotp
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'

CORS(app)

# Example storage (use a database in production)
user_secrets = {}

def encode_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/api', methods=['GET'])
def hello_world():
    return jsonify({'message': 'Hello, World!'})

@app.route('/api/generate_totp', methods=['GET'])
def generate_totp():
    username = request.args.get('username')
    
    # Generate a new secret for each request
    secret = pyotp.random_base32()
    user_secrets[username] = secret
    
    totp = pyotp.TOTP(secret)
    return jsonify({'otp_url': totp.provisioning_uri(username, issuer_name='YourApp')})

@app.route('/api/verify_totp', methods=['POST'])
def verify_totp():
    data = request.json
    username = data.get('username')
    otp = data.get('otp')

    secret = user_secrets.get(username)
    if not secret:
        return jsonify({'error': 'Invalid user'}), 400

    totp = pyotp.TOTP(secret)
    if totp.verify(otp):
        return jsonify({'message': 'OTP is valid'})
    return jsonify({'error': 'Invalid OTP'}), 400

@app.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    print(f"Request method: {request.method}")
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'admin':
        token = encode_token(username)
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


# Single same QR code 

# from flask import Flask, request, jsonify
# import datetime
# import jwt
# import pyotp
# from flask_cors import CORS

# app = Flask(__name__)
# app.config['SECRET_KEY'] = '1234'

# CORS(app)

# # # Example storage (use a database in production)
# user_secrets = {
#     'admin': pyotp.random_base32()  # Generate a TOTP secret for the user
# }

# def encode_token(user_id):
#     payload = {
#         'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
#         'iat': datetime.datetime.utcnow(),
#         'sub': user_id
#     }
#     return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# @app.route('/generate_totp', methods=['GET'])
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

# if __name__ == '__main__':
#     app.run(debug=True)
