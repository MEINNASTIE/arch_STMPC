### file serving a gunicorn via nginx for authentication

// path to nginx configuration file
/etc/nginx/nginx.conf

pay attention to have it also configured for the yocto environment // when it comes to nginx and authelia especially

notes:
`python app.py` - start python backend server
`npm run dev` - current start until migration

#### regarding vite config

setup template by berry which requires to be integrated

#### tasks:
    - routing system develop more
    - implement another authentication system
    - handle more pages

#### regarding gunicorn

`gunicorn --workers 3 app:app` have at least 3 workers working for efficiency 
`sudo gunicorn --workers 3 --bind unix:/home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/server/gunicorn.sock app:app` to run a socket for gunicorn 

to check unix user: id -un // group:  id -gn
