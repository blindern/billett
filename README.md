# UKA på Blindern's ticket system (frontend)

More details about this system is available at:
https://github.com/blindernuka/billett

## Setup

### Requirements

#### npm (package manager for node.js)
A lot of tools we use are javascript tools which we need `npm` to install. This should probably be installed system wide with `sudo apt-get install npm` or similar, and will also make sure Node.js is installed so we can run these applications.

### Initial setup
* Make sure requirements are met
* Install global Node.js-tools (might need sudo):<br>```$ npm install -g gulp bower```
* Load required Node.js-tools:<br>```$ npm install```
* Install bower-dependencies: (bower is installed above with npm)<br>```$ bower install```
* Continue on updating section

### Updating
* If `packages.json` is changed, install new npm-dependencies:<br>```$ npm install```
* If `bower.json` is changed, install new bower-dependencies:<br>```$ bower install```
* Regenerate static files:<br>```gulp production``` (see development section for development tips)

### Developing
* When javascript/scss-sources are changed, new static files must be compiled. The easiest way to handle this is to make gulp run in background and watch files:<br>```$ gulp watch```
* or you may manually create the static files every time:<br>```$ gulp```
