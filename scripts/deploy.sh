#!/bin/bash

# set working directory to the directory if this script
cd "$(dirname "$0")"

# exit on errors
set -e

if [ ! -z "$TRAVIS" ]; then
  echo "Decrypting ssh-key and adding"
  openssl aes-256-cbc -K $encrypted_f930278f26a2_key -iv $encrypted_f930278f26a2_iv -in travis-key.enc -out travis-key -d
  chmod 600 travis-key
  eval "$(ssh-agent)"
  ssh-add travis-key
fi

env=''
if [ "$TRAVIS_BRANCH" == "test" ]; then
    env=test
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    env=prod
else
    >&2 echo "Unkown branch '$TRAVIS_BRANCH'"
    exit 1
fi

commit=${TRAVIS_COMMIT::8}
tag=$([ "$TRAVIS_BRANCH" == "master" ] && echo "latest" || echo $TRAVIS_BRANCH)

echo "Running remote SSH-script"
ssh -p 2222 -o StrictHostKeyChecking=no core@server2016.blindernuka.no /bin/bash << EOF
  set -e

  # we use the prod server as build server as well,
  # simply to get some better caching than travis can provide
  # (use a seperate folder for it so it is seperate to prod environment)
  if ! [ -d /tmp/billett-build ]; then
    git clone https://github.com/blindernuka/billett.git /tmp/billett-build
  fi
  cd /tmp/billett-build
  git fetch
  git checkout $TRAVIS_COMMIT

  docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
  time docker build -t blindernuka/billett-backend:$tag -t blindernuka/billett-backend:$commit .
  time docker push blindernuka/billett-backend:$tag
  time docker push blindernuka/billett-backend:$commit

  # now update production
  if [ "$env" == "prod" ]; then
    cd ~/billett

    # update the git repo to get any changes to docker compose and such
    git fetch
    git checkout $TRAVIS_COMMIT

    config="-f docker-compose.yaml -f docker-compose.prod.yaml"
    compose="/opt/bin/docker-compose \$config"
    if \$compose ps fpm | grep -q " Up "; then
      # docker-compose will rerun containers having newer images available
      \$compose up -d
      \$compose exec -T fpm ./artisan migrate
    else
      echo "No running instance to restart with new deployment"
    fi
  fi
EOF

echo "Deploy finished"
