### file serving a gunicorn via nginx for authentication
this environment has been specifically set up for arch linux to run on systemd as a service, the config is set based on distro

#### nginx example config

```
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
	listen 80;
	server_name 127.0.0.1;

	# Redirect all HTTP traffic to HTTPS
	return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name 127.0.0.1;

	# self assigned for testing
	ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
        ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

	ssl_protocols TLSv1.2 TLSv1.3;
	ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            root /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/vite/dist/;
            try_files $uri /index.html;
        }

	 location /server {
	 alias /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/;
	}

        location /api {
            proxy_pass http://unix:/home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/gunicorn.sock;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

	    add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
        }

        error_page 500 502 503 504 /404.html;
        location = /404.html {
            root /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/;
            internal;
        }
    }
}
```

// path to nginx configuration file
/etc/nginx/nginx.conf

#### gunicorn.service config

```
[Unit]
Description=Gunicorn service to serve Flask app
After=network.target

[Service]
User= #user
Group= #user
WorkingDirectory=/your_path/server/
Environment="PATH=/your_path/server/venv/bin/"
ExecStart=/your_path/server/venv/bin/gunicorn --workers 3 --bind unix:/your_path/server/gunicorn.sock app:app

[Install]
WantedBy=multi-user.target
```

// path to gunicorn.service file
/etc/systemd/system/gunicorn.service

*notes:
`python app.py` - start python backend server
`npm run dev` - current start until migration

#### regarding vite config

setup template by berry which requires to be integrated

- npm run build // dist present always for nginx testing 

#### tasks:
    - routing system develop more
    - implement another authentication system
    - handle more pages

#### regarding gunicorn

`gunicorn --workers 3 app:app` have at least 3 workers working for efficiency 
`sudo gunicorn --workers 3 --bind unix:/home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/gunicorn.sock app:app` to run a socket for gunicorn 

to check unix user: id -un // group:  id -gn

#### self certificate ssl for local testing
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt

#### SSL certificate 
sudo certbot --nginx -d yourdomain.com

mono storageApi.exe - to run local web config 

