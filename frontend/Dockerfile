FROM nginx:1.31.7@sha256:8632b3314d74c61f0e27f59055bab13f7793b988c94c090154d867bc29e0f39b

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
