#!/bin/sh

set -e

npm run dist

rm -Rf /usr/src/app-dist/latest
mv /usr/src/app/dist /usr/src/app-dist/latest
