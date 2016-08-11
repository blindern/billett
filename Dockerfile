FROM php:5.6-fpm
#FROM php:5.6-apache
MAINTAINER Henrik Steen <henrist@henrist.net>

ENV SIMPLESAMLPHP_VERSION 1.14.7
ENV SIMPLESAMLPHP_SHA256 a7a24d4dc89819f7e53141b38ae36b092a5c1fc9cb2e3cee253c765e5942be52

RUN \
    # system packages
    apt-get update \
    && apt-get install -y --no-install-recommends \
      curl \
      git \
      libmcrypt-dev \
      unzip \
    && rm -rf /var/lib/apt/lists/* \
    \
    # php extensions
    && docker-php-ext-install -j$(nproc) mcrypt pdo_mysql \
    \
    # set up composer
    && php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');" \
    && php -r "if (hash_file('SHA384', '/tmp/composer-setup.php') === 'e115a8dc7871f15d853148a7fbac7da27d6c0030b848d9b3dc09e2a0388afed865e6a3d6b3c0fad45c48e2b5fc1196ae') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('/tmp/composer-setup.php'); } echo PHP_EOL;" \
    && php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('/tmp/composer-setup.php');" \
    \
    # simplesamlphp
    && mkdir /var/simplesamlphp \
    && cd /var/simplesamlphp \
    && curl -fSL "https://github.com/simplesamlphp/simplesamlphp/releases/download/v$SIMPLESAMLPHP_VERSION/simplesamlphp-$SIMPLESAMLPHP_VERSION.tar.gz" -o simplesamlphp.tar.gz \
    && echo "$SIMPLESAMLPHP_SHA256 *simplesamlphp.tar.gz" | sha256sum -c - \
    && tar --strip-components=1 -zxf simplesamlphp.tar.gz \
    && rm simplesamlphp.tar.gz \
    \
    # billett
    && mkdir -p /var/billett/cache \
    && mkdir -p /var/billett/logs \
    && mkdir -p /var/billett/meta \
    && mkdir -p /var/billett/sessions \
    && mkdir -p /var/billett/views \
    && chown -R www-data:www-data /var/billett

# configure simplesamlphp
ADD simplesamlphp/config.override.php /var/simplesamlphp/config/
ADD simplesamlphp/authsources.php /var/simplesamlphp/config/
ADD simplesamlphp/saml20-idp-remote.php /var/simplesamlphp/metadata/
RUN cd /var/simplesamlphp && tail -n +2 config/config.override.php >>config/config.php

VOLUME ["/var/simplesamlphp", "/var/billett"]
