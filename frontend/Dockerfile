FROM nginx:1.31.10@sha256:a786635fd3c7b9a57ea089ab1c0713e510f3b548b65fe699ce3d59e4a926b37e

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
