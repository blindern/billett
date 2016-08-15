FROM node:6
MAINTAINER Henrik Steen <henrist@henrist.net>

# use gosu in entrypoint
ENV GOSU_VERSION 1.9
RUN set -x \
    && dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')" \
    && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch" \
    && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc" \
    && export GNUPGHOME="$(mktemp -d)" \
    && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
    && rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true

RUN mkdir -p /usr/src/app /usr/src/app-dist
COPY container/entrypoint.sh /entrypoint.sh
COPY container/build-dist.sh /build-dist.sh
COPY container/dev.sh /dev.sh

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/

RUN /build-dist.sh

VOLUME ["/usr/src/app/node_modules"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/build-dist.sh"]
