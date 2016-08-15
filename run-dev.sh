#!/bin/bash

# This script is used to run an independent development server.
# See docker-compose.yaml in backend repo for running frontend development
# with full backend stack

# Set BACKEND_URL as environment variable to override the default
# e.g.: BACKEND_URL=https://blindernuka.no/billett/ ./run-dev.sh

# fetch from docker hub instead of building locally
#docker build -t blindernuka/billett-frontend .

if [ -n "$BACKEND_URL" ]; then
  backend_url="$BACKEND_URL"
else
  backend_url=http://localhost:8081/billett/
fi

command=/dev.sh
if [ -n "$1" ]; then
    command="$@"
fi

docker run \
  -it \
  --rm \
  -v "$(pwd)":/usr/src/app \
  -v billett-node_modules:/usr/src/app/node_modules \
  -v billett-frontend-dist:/usr/src/app-dist \
  -p 3000:3000 \
  -e BACKEND_URL="$backend_url" \
  blindernuka/billett-frontend \
  $command
