# UKA på Blindern's ticket system

This project contains code for running UKA på Blindern's ticket system.
Even though the code is in production, it currently lacks a few features
and is probably little of use for others.

More documentation: [Documentation (norwegian)](docs/index.md)

## Architecture

This project is run with Docker and mainly consists of:

* PHP backend container running php-fpm serving the backend api
* nginx container that serves the static files and acts as a proxy to the backend
* mysql container as database

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

Docker Compose is used to simplify running the containers locally.

### Running the backend

```bash
docker compose up database
```

```bash
cd backend
composer install
php artisan serve --port 8081
```

http://localhost:8081/

### Running the frontend

```bash
cd frontend
npm ci
BACKEND_URL=https://billett.blindernuka.no/ npm run dev
```

Open http://localhost:3000/

### Running phpMyAdmin for development

```bash
docker compose up phpmyadmin
```

Now go to http://localhost:8080/
