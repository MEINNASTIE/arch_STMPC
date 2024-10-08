import requests
import base64

def init_admin(username, password):
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

admin_payload = init_admin('admin', 'admin')

if admin_payload:
    print("Admin initialization successful:")
    print(admin_payload)

#######################
import requests
import base64

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



##########

worker_processes 3;

user meinna meinna;
error_log  /var/log/nginx/error.log warn;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    accept_mutex off;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        
        root /home/meinna/mpcapp/web;
        index index.html index.htm;
        server_name _;

        # Redirect all HTTP to HTTPS (optional)
        return 301 https://$host$request_uri;

        # redirect server error pages to the static page /50x.html
        error_page 500 502 503 504 /50x.html;

        location /api {
            proxy_pass http://localhost:8005/api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS settings (ensure these are set correctly only once)
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept';

            # Handle OPTIONS method
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept';
                return 204;  # Respond to preflight requests
            }
        }
    }

    server {
        listen 443 ssl;
        server_name 192.168.10.129;

        # SSL configuration
        ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
        ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Root for the app
        location / {
            root /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/vite/dist/;
            try_files $uri /index.html;
        }

        # Serve /server from alias
        location /server {
            alias /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/;
        }

        # Proxy /test to gunicorn via Unix socket
        location /test {
            proxy_pass http://unix:/home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/gunicorn.sock;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS settings (ensure they are correct)
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        }

        # Proxy /api to external server (adjust as necessary)
        location /api {
            proxy_pass http://localhost:8005;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Add CORS headers here if needed
        }

        # Error page
        error_page 500 502 503 504 /404.html;
        location = /404.html {
            root /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/;
            internal;
        }
    }
}

