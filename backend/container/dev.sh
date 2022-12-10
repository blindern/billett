#!/bin/sh

gosu www-data:www-data bash -c '
  if ! [ "$(ls -A /var/www/html/vendor)" ]; then
    cp -r /var/www/html-vendor/* /var/www/html/vendor/;
    chown -R www-data:www-data /var/www/html/vendor;
  fi;
  cd /var/www/html;
  composer install'

php-fpm
