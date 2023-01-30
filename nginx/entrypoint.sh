#!/usr/bin/env sh
set -eu

# shellcheck disable=SC2016
envsubst '${FPM_HOST} ${FRONTEND_URL} ${PRERENDER_TOKEN}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
