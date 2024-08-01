from flask import Flask, request, jsonify
import datetime
import jwt
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = '1234'

CORS(app)

def encode_token(user_id):
    """Encode a new JWT token."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'admin':
        token = encode_token(username)
        return jsonify({'token': token})

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/protected', methods=['GET'])
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

if __name__ == '__main__':
    app.run(debug=True)
