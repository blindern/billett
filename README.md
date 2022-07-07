# UKA på Blindern's ticket system

This project contains code for running UKA på Blindern's ticket system.
Even though the code is in production, it currently lacks a few features
and is probably little of use for others. The plan is to have a more complete
feature set by the end of 2016.

More documentation: [Documentation (norwegian)](docs/index.md)

## Architecture

This project is run with Docker and mainly consists of:

* PHP backend container running php-fpm serving the backend api as well as simplesamlphp for authentication
* node frontend image that compiles static frontend files
* nginx container that serves the static files and acts as a proxy to the backend
* mysql container as database

The frontend repository is located at https://github.com/blindernuka/billett-frontend

Docker Compose is used to simplify running the containers.

## Backend API details

The backend runs Laravel and provides only an API for the frontend. See the
Laravel web page for more details.

## Production setup

The production setup is managed from
https://github.com/blindern/drift

As of July 2022 deployment to production is manually.

Command to run migrations after deploying new version:

```bash
ssh root@fcos-1.nrec.foreningenbs.no
docker exec -t uka-billett-fpm ./artisan migrate
```

## Development setup

To ease development, see `Makefile`

Normally all that is needed is to run:

`make dev`

And the development environment should start and be available
at http://localhost:8081/

## Running phpMyAdmin for development

`docker-compose -f docker-compose.admin.yml up`

Now go to http://localhost:8080/
