FROM nginx:1.29.4@sha256:c881927c4077710ac4b1da63b83aa163937fb47457950c267d92f7e4dedf4aec

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
