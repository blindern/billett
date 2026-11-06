FROM nginx:1.31.8@sha256:165ddde8751e75a1c907d24ef10d9f6deb08b57e0fe56caf67512486aff76d82

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
