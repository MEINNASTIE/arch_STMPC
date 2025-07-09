#give access to nginx to mpc web folder
chmod o+x-rw /home/mpcapp
chmod o+x-rw /home/mpcapp/web
chmod o+r-wx /home/mpcapp/web/*.*

systemctl restart nginx


