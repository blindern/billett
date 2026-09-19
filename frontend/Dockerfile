FROM nginx:1.31.6@sha256:fd3d3f71bb0786f6af087db3e44e3cc5cdc5e3eca41f9646af23bbc7bc789376

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
