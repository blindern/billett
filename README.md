# UKA på Blindern's ticket system (frontend)

More details about this system is available at:
https://github.com/blindernuka/billett

## Details

* Npm for dependencies
* Webpack for module loading and building
* Angular 1.x

## Setup

The application is run inside Docker, so make sure Docker is up and running.

The backend repo contains a script that will run both backend and frontend together.

### Development version

Simply run the provided `run-dev.sh` script.

It will run a Docker-instance, mounting the source code, install npm packages and
start Webpack development server on port 3000. It will also listen to changes in
the source code and rebuild the application on-the-fly.

http://localhost:3000/

If you want to testing against production data you can set the backend to production:

`BACKEND_URL=https://billett.blindernuka.no/ ./run-dev.sh`

### Running npm commands

Instead of running the development server, another command can be passed
to the `run-dev.sh` script:

```bash
./run-dev.sh bash

# you now have a shell inside the docker container
npm -v
```

### Building dist files

The dist files are the files that are served in the production environment.

See the script `container/build-dist.sh`.

Files are build to /usr/src/app-dist.

See the backend repo that contains nginx for more details how this is set up.
