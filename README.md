## Repo information 

- /dist - serving application /
- /vite - contains project source code without the bundle
- /docu - additional sources for developer

## Additional information for developer meinna

### file serving a gunicorn via nginx for authentication
this environment has been specifically set up for arch linux to run on systemd as a service, the config is set based on distro

current /dist is not entirely optimised // current development going on 

// local path to gunicorn.service file
/etc/systemd/system/gunicorn.service

*notes:
`python app.py` - start python backend server
`npm run dev` - current start until migration

#### regarding vite config

berry template integrated with regular react functionalities

- npm run build // dist present for development testing but ready for production 

to check unix user: id -un // group:  id -gn

- security 
gunicorn --certfile=path/to/cert.pem --keyfile=path/to/key.pem -w 4 -b 0.0.0.0:443 app:app

#### self certificate ssl for local testing
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt

#### SSL certificate 
sudo certbot --nginx -d yourdomain.com

mono storageApi.exe - to run local web config 

example for permitting rights to the nginx conf: sudo chmod 666 /home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/*.sock

folder spec conf file:

nginx - /etc/nginx/nginx.conf
gunicorn/login service - /etc/systemd/system/gunicorn.service - login.service 
ssl key - /etc/ssl/private/nginx-selfsigned.key


https://chatgpt.com/share/67fcd574-ffac-800b-9fa8-055333cf3a08