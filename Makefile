# this file is to easier set up docker stuff

all: build
	docker-compose up -d

build:
	docker-compose \
		-f docker-compose.yaml -f docker-compose.dev.yaml \
		build

dev:
	docker-compose \
		-f docker-compose.yaml -f docker-compose.dev.yaml \
		up

shell:
	docker-compose \
		-f docker-compose.yaml -f docker-compose.dev.yaml \
		run --rm fpm bash

down:
	docker-compose down --remove-orphans -v
