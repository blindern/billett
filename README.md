# UKA på Blindern's ticket system

**This is an incomplete project!**

More documentation: [Documentation (norwegian)](docs/index.md)

## Setup

### Requirements
* PHP 5.4+

#### Composer
Composer is a package manager for PHP. It is used to install the Laravel framework and other third party packages we use. See https://getcomposer.org/download/

### Initial setup
* Make sure requirements are met
* Set up configuration (see section below)
* Install PHP-dependencies:<br>```$ composer install```
* Continue on updating section

### Updating
* If `composer.json` is changed, install new PHP-dependencies:<br>```$ composer install```

### Configuration
Create the file ```/.env.php```:
```php
<?php
return array(
	'BILLETT_KEY' => 'REPLACE',
	'BILLETT_MYSQL_PASS' => 'REPLACE'
);
?>
```

There are also environment configuration stored in `/app/config/ENVIRONMENT/`, where `ENVIRONMENT` is configured in `/bootstrap/start.php`. This overrides configuration files in `/app/config/`.

### Prerender service
Search engines, Facebook, and more, will normally only grab the template, and not include response from API-calls. To make sure they get a full page, requests are intercepted and served through a service which generates static html.

We use [Prerender](https://prerender.io/) for this.

To enable configuration for this, create a configuration file for the environment in `app/config/packages/nutsweb/laravel-prerender/ENVIRONMENT/config.php` that enables prerender and sets the token, e.g.:

```php
<?php
return [
    'enable' => true,
    'prerender_token' => 'TOKEN-HERE'
];
?>
```
