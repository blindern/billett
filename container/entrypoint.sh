#!/bin/bash

# make sure we are the same user as the one who owns the files

if [ "$1" != "php-fpm" ] && [ -f /var/www/html/README.md ]; then
  uid=$(stat -c %u /var/www/html/README.md)
  gid=$(stat -c %u /var/www/html/README.md)

  if [ $(id -u) != $(stat -c %u /var/www/html/README.md) ]; then
    userdel app 2>/dev/null || true
    groupdel app 2>/dev/null || true
    groupadd -g $gid app
    useradd -m -g $gid -u $uid app
    gosu app "$@"
    exit
  fi
fi

exec "$@"
