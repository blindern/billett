FROM nginx:1.30.0@sha256:0c3a604353135ac13f3a991e2a98c9958af7b8c0b7251ce1590e0c5ff5e3692c

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
