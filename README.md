### this file serves as a small guidance into setting up nginx reverse proxy with authelia for a simple react authentication web application
#### by meinna

// enable authelia on system and check // same for nginx 
sudo systemctl enable authelia
sudo systemctl start authelia
sudo systemctl status authelia

// path to nginx configuration file
/etc/nginx/nginx.conf

// path to configuration.yml
/etc/authelia/configuration.yml
/etc/authelia/users_database.yml

// path to system authelia.service
/etc/systemd/system/authelia.service

pay attention to have it also configured for the yocto environment // when it comes to nginx and authelia especially

notes:
`python app.py` - start python backend server
`npm run dev` - current start until migration

#### regarding vite config

setup template by berry which requires to be integrated

#### tasks:
    -  28.08. migrate server and login to berry 
    -  28.08. create most components 
    -  29.08. authelia // add two factor authorization