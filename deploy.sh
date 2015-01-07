#!/bin/bash

# TODO: check if packages.json etc. change on git pull, if not skip their install

git pull
composer install

php artisan migrate

npm install
bower install

gulp production