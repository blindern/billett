FROM nginx:1.31.6@sha256:78758a47dc59a81fc8354d83d17135d52cfaf6894c696886b807b9371c3648a4

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
