#!/bin/bash

# Define variables
WORKING_DIR="/home/mpcapp/web/Aserver"
VENV_PATH="/home/mpcapp/web/Aserver/venv/bin"
APP_MODULE="app:app"
HOST="0.0.0.0"
PORT="8000"
WORKERS=3

# Navigate to the working directory
cd "$WORKING_DIR" || exit 1

# Activate the virtual environment
source "$VENV_PATH/activate"

# Start Gunicorn
"$VENV_PATH/gunicorn" --workers "$WORKERS" --bind "$HOST:$PORT" "$APP_MODULE"
