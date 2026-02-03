FROM nginx:1.29.4@sha256:9dd288848f4495869f76676e419ae2d767ca99fece2ec37ec0261f9fdaab5204

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
