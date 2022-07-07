FROM node:16-slim

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      gosu \
    ; \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app /usr/src/app-dist
COPY container/entrypoint.sh /entrypoint.sh
COPY container/build-dist.sh /build-dist.sh
COPY container/dev.sh /dev.sh

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN npm ci

COPY . /usr/src/app/

RUN /build-dist.sh

VOLUME ["/usr/src/app/node_modules"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/build-dist.sh"]
