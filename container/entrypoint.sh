#!/bin/bash

# make sure we are the same user as the one who owns the files
# this is relevant in development when the developer's source code is mounted in
if [ -f /usr/src/app/README.md ]; then
  uid=$(stat -c %u /usr/src/app/README.md)
  gid=$(stat -c %u /usr/src/app/README.md)

  if [ $(id -u) != $(stat -c %u /usr/src/app/README.md) ]; then
    userdel app 2>/dev/null || true
    groupdel app 2>/dev/null || true
    groupadd -g $gid app
    useradd -m -g $gid -u $uid app

    # make sure node_modules is owned by this user
    chown -R app:app /usr/src/app/node_modules

    gosu app "$@"
    exit
  fi
fi

exec "$@"
