<?php

$config = array_merge($config, array(
    'baseurlpath' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/billett/saml/',
    'auth.adminpassword' => getenv('SIMPLESAMLPHP_ADMINPASS'),
    'secretsalt' => getenv('SIMPLESAMLPHP_SECRETSALT'),
    'technicalcontact_name' => 'IT-gruppa',
    'technicalcontact_email' => 'it-gruppa@foreningenbs.no',
    'timezone' => 'Europe/Oslo',
    'session.cookie.name' => 'saml_billett_sid',
    'session.cookie.path' => '/billett/',
    'session.cookie.secure' => false, // change to true when https is up
    'session.authtoken.cookiename' => 'SimpleSAMLAuthToken_billett',
    'language.default' => 'no',
));
