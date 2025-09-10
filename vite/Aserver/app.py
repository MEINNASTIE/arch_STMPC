import os
import base64
import hashlib
import datetime
import secrets
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt

MIN_SECRET_KEY_LENGTH = 32
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    SECRET_KEY = secrets.token_urlsafe(32)
    print("WARNING: No SECRET_KEY provided in environment. Generated a temporary key.")
    print("WARNING: For production use, please set SECRET_KEY in your environment variables.")
elif len(SECRET_KEY) < MIN_SECRET_KEY_LENGTH:
    raise ValueError(f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters long")
elif SECRET_KEY == '1234':
    raise ValueError("SECRET_KEY cannot use the default value '1234'")

ALGORITHM = "HS256"
API_BASE_URL = "/api"
SALT_LENGTH = 64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add this middleware near the top, after app = FastAPI()
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[DEBUG] Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# keep in mind for production time
# @app.middleware("http")
# async def restrict_api_access(request: Request, call_next):
#     if request.url.path.startswith(API_BASE_URL):
#         token = request.headers.get('Authorization')
#         if not token or not token.startswith('Bearer '):
#             raise HTTPException(status_code=403, detail="Access denied to this API endpoint")

#         token = token.split()[1]
#         try:
#             payload = verify_token(token)
#         except HTTPException as e:
#             raise e  

#     response = await call_next(request)
#     return response

def generate_jwt(user_id: str, allow_api=False):
    payload = {
        'sub': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        'iat': datetime.datetime.utcnow(),
        'allow_api': allow_api
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        if token.startswith('Bearer '):
            token = token.split()[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get('allow_api', False):
            raise HTTPException(status_code=403, detail="Access denied: API access not allowed")
        return payload
    except JWTError as e:
        if isinstance(e, jwt.ExpiredSignatureError):
            raise HTTPException(status_code=401, detail="Token has expired")
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_hash(username: str, password: str) -> str:
    salt = secrets.token_bytes(SALT_LENGTH)

    combined = f"{username};{password}".encode('utf-8') + salt
    
    hash_value = hashlib.pbkdf2_hmac(
        'sha512',  
        combined,
        salt,
        310000  
    )
    
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    hash_b64 = base64.b64encode(hash_value).decode('utf-8')
    
    return f"{salt_b64}:{hash_b64}"

def get_full_api_url(relative_url: str, request: Request):
    scheme = request.url.scheme
    host = request.client.host
    port = request.url.port or 80
    return f"{scheme}://{host}:{port}{relative_url}"

@app.get("/api/users/count")
async def get_user_count(request: Request):
    url = get_full_api_url(f"{API_BASE_URL}/users", request)
    response = requests.get(url, verify=False)
    if response.status_code == 200:
        users = response.json()
        admin_exists = any(user.get('rolename') == 'admin' for user in users)
        return {"count": len(users), "admin_exists": admin_exists}
    raise HTTPException(status_code=500, detail="Error fetching users")

@app.get("/api/user/hash/{username_password_hash_b64}")
async def get_user_by_hash(username_password_hash_b64: str, request: Request):
    url = get_full_api_url(f"{API_BASE_URL}/user/hash/{username_password_hash_b64}", request)
    response = requests.get(url, verify=False)
    if response.status_code == 200:
        user_data = response.json()
        user_id = user_data.get('payload', {}).get('userId')
        if user_id:
            user_data['token'] = generate_jwt(user_id)
            return user_data
    raise HTTPException(status_code=404, detail="User not found or error retrieving user data")

@app.post("/token")
async def generate_token(request: Request):
    import base64
    import hashlib
    data = await request.json()
    print(f"[DEBUG] /token received data: {data}")
    username = data.get('username')
    token = data.get('token')
    user_id = data.get('userId')
    allow_api = data.get('allowApi', False)
    print(f"[DEBUG] username: {username}")
    print(f"[DEBUG] token: {token}")
    print(f"[DEBUG] user_id: {user_id}")
    print(f"[DEBUG] allow_api: {allow_api}")

    if username in ["bertin", "service"] and token:
        print(f"[DEBUG] Entering bertin/service logic branch for user: {username}")
        token_file_path = f"/home/mpcapp/_cfg/keys/webui/{username}/tokenhash"
        print(f"[DEBUG] token_file_path: {token_file_path}")
        try:
            with open(token_file_path, "r") as f:
                expected_token = f.read().strip()
            print(f"[DEBUG] expected_token: {expected_token}")
        except Exception as e:
            print(f"[DEBUG] Could not read token file for user {username}: {e}")
            raise HTTPException(status_code=500, detail="Token file not found or unreadable")
        if token != expected_token:
            print(f"[DEBUG] Token mismatch for user {username}")
            raise HTTPException(status_code=401, detail="Invalid token for user (raw compare)")
        print(f"[DEBUG] Token matches for user {username}")

        # --- PREPARE FOR CONFIGAPI VALIDATION ---
        # To enable configAPI validation, uncomment the following block:
        """
        import base64
        import hashlib
        token_hash_b64 = base64.b64encode(hashlib.sha256(token.encode()).digest()).decode()
        config_api_url = get_full_api_url(f"/api/user/tokenhash?username={username}&tokenhash={token_hash_b64}", request)
        print(f"[DEBUG] Calling configAPI: {config_api_url}")
        try:
            response = requests.get(config_api_url, verify=False)
            print(f"[DEBUG] configAPI response status: {response.status_code}")
            print(f"[DEBUG] configAPI response body: {response.text}")
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="ConfigAPI validation failed")
        except Exception as e:
            print(f"[DEBUG] Error contacting configAPI: {e}")
            raise HTTPException(status_code=500, detail="ConfigAPI error")
        """
        # --- END CONFIGAPI VALIDATION PREP ---

        user_id = f"{username}-265735428"
        jwt_token = generate_jwt(user_id)
        print(f"[DEBUG] Returning JWT for user: {user_id}")
        return JSONResponse(content={
            "token": jwt_token,
            "userId": user_id,
            "username": username,
            "roles": ["factory"]
        }, status_code=200)
    elif user_id:
        print(f"[DEBUG] Entering old logic branch for user_id: {user_id}")
        jwt_token = generate_jwt(user_id, allow_api)
        print(f"[DEBUG] Returning JWT for user_id: {user_id}")
        return JSONResponse(content={"token": jwt_token}, status_code=200)
    else:
        print(f"[DEBUG] Missing credentials branch")
        raise HTTPException(status_code=400, detail="Missing credentials")

@app.get("/api/protected")
async def protected(request: Request):
    token = request.headers.get('Authorization')
    if not token:
        raise HTTPException(status_code=403, detail="Token is missing!")
    
    payload = verify_token(token)
    return {"message": "Protected content", "user": payload['sub']}
