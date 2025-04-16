#!/bin/bash

WORKING_DIR="/home/meinna/VCS_Projects/arch_linux_authelia-nginx-authentication-app/Aserver"
VENV_PATH="$WORKING_DIR/venv/bin"
APP_MODULE="app:app"
HOST="0.0.0.0"
PORT="8007"

cd "$WORKING_DIR" || exit 1
source "$VENV_PATH/activate"

"$VENV_PATH/uvicorn" "$APP_MODULE" --host "$HOST" --port "$PORT"
