#!/bin/bash

# make sure we are the same user as the one who owns the files
# this is relevant in development when the developer's source code is mounted in
if [ "$1" != "php-fpm" ] && [ -d /var/www/html/app ]; then
  uid=$(stat -c %u /var/www/html/app)
  gid=$(stat -c %u /var/www/html/app)

  if [ $(id -u) != $(stat -c %u /var/www/html/app) ]; then
    olduid=$(id -u www-data)
    oldgid=$(id -g www-data)

    usermod -u $uid www-data
    groupmod -g $gid www-data
    find /var -user $olduid -exec chown -h $uid "{}" \; 2>/dev/null
    find /var -group $oldgid -exec chgrp -h $gid "{}" \; 2>/dev/null
    usermod -g $gid www-data

    # make sure vendor is owner by this user
    chown -R www-data:www-data /var/www/html/vendor
  fi
else
  chown -R www-data:www-data /var/billett
fi

exec "$@"
