# UKA på Blindern's ticket system

This project contains code for running UKA på Blindern's ticket system.
Even though the code is in production, it currently lacks a few features
and is probably little of use for others.

More documentation: [Documentation (norwegian)](docs/index.md)

## Architecture

This project is run with Docker and mainly consists of:

* PHP backend container running php-fpm serving the backend api as well as simplesamlphp for authentication
* nginx container that serves the static files and acts as a proxy to the backend
* mysql container as database

Docker Compose is used to simplify running the containers.

## Backend API details

The backend runs Laravel and provides only an API for the frontend. See the
Laravel web page for more details.

## Production setup

Deployments is automated on every build. See GitHub Action and
https://github.com/blindern/drift/tree/master/ansible/roles/service-uka-billett

Command to run migrations after deploying new version:

```bash
ssh root@fcos-1.nrec.foreningenbs.no
docker exec -t uka-billett-fpm ./artisan migrate
```

## Development setup

### Running the backend

To ease development, see `Makefile`

Normally all that is needed is to run:

```bash
make dev
# to make it proxy for the frontend aswell
# you might need to run it like this (with the
# correct IP):
DOCKER_GATEWAY_HOST=172.18.0.1 make dev
```

And the development environment should start and be available
at http://localhost:8081/

### Running the frontend

```bash
cd frontend
npm ci
BACKEND_URL=https://billett.blindernuka.no/ npm run dev
```

Open http://localhost:3000/

## Running phpMyAdmin for development

```bash
docker-compose -f docker-compose.admin.yml up
```

Now go to http://localhost:8080/
