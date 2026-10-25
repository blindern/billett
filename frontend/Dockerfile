FROM nginx:1.31.8@sha256:6e67f8eaac94fc456588d4ff6c470d984841f5b5dc4279863d5cbe6ec5a60def

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
