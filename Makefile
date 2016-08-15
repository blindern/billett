# this file is to easier set up docker stuff

all: frontend-dist backend
	docker-compose up -d

backend:
	docker build -t blindernuka/billett-backend-base .

frontend-dist:
	# this builds the frontend applications and puts the file in
	# a directory that is mounted by nginx and served as static files
	docker build -t blindernuka/billett-frontend-base billett-frontend
	docker build -t blindernuka/billett-frontend -f billett-frontend/Dockerfile-dist billett-frontend
	docker run \
		-v $(CURDIR)/.data/billett-frontend-dist:/usr/src/app-dist \
		blindernuka/billett-frontend \
		/build-dist.sh

rebuild:
	docker-compose build

dev:
	# this runs the development server of the frontend
	# instead of serving the static files through nginx
	docker-compose \
		-f docker-compose.yaml -f docker-compose.dev.yaml \
		up

down:
	docker-compose down --remove-orphans -v
