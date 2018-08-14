#!/bin/bash

# set working directory to the directory if this script
cd "$(dirname "$0")"

# exit on errors
set -e

if [ ! -z "$TRAVIS" ]; then
  echo "Decrypting ssh-key and adding"
  openssl aes-256-cbc -K $encrypted_bc5f58925691_key -iv $encrypted_bc5f58925691_iv -in travis-key.enc -out travis-key -d
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
  if ! [ -d /tmp/billett-frontend-build ]; then
    git clone https://github.com/blindernuka/billett-frontend.git /tmp/billett-frontend-build
  fi
  cd /tmp/billett-frontend-build
  git fetch
  git checkout $TRAVIS_COMMIT

  docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
  time docker build -t blindernuka/billett-frontend:$tag -t blindernuka/billett-frontend:$commit .
  time docker push blindernuka/billett-frontend:$tag
  time docker push blindernuka/billett-frontend:$commit

  # now update production
  if [ "$env" == "prod" ]; then
    # the image already contains the built dist so we only
    # need to copy it from the image to the volume
    docker run \
      --rm \
      -v ~/billett/.data/billett-frontend-dist:/dst \
      blindernuka/billett-frontend:$commit \
      sh -c "rm -rf /dst/latest; cp -rp /usr/src/app-dist/latest /dst/"
  fi
EOF

echo "Deploy finished"
