FROM nginx:1.31.6@sha256:f6ee2eff6bc131ec351c3c70e95c146fa12b2eb4426954e5279bbda36740667e

COPY container/default.conf /etc/nginx/conf.d/default.conf

COPY dist/billett/browser /usr/share/nginx/html
