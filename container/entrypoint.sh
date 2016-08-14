#!/bin/bash

# make sure we are the same user as the one who owns the files

uid=$(stat -c %u /usr/src/app/README.md)
gid=$(stat -c %u /usr/src/app/README.md)

if [ $(id -u) != $(stat -c %u /usr/src/app/README.md) ]; then
  userdel app 2>/dev/null || true
  groupdel app 2>/dev/null || true
  groupadd -g $gid app
  useradd -m -g $gid -u $uid app
  gosu app "$@"
  exit
fi

exec "$@"
