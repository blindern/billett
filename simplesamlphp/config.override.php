<?php

// we run behind a reverse proxy (nginx) that does the ssl job..
// we don't need to bother checking $_SERVER['HTTPS']
$proto = isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : 'http';
if ($proto == "https") {
    // ugly hack for getting the redirects to work
    $_SERVER['SERVER_PORT'] = 443;
    $_SERVER['HTTPS'] = 'on';
}

$config = array_merge($config, array(
    'baseurlpath' => $proto . '://' . $_SERVER['HTTP_HOST'] . '/saml/',
    'auth.adminpassword' => getenv('SIMPLESAMLPHP_ADMINPASS'),
    'secretsalt' => getenv('SIMPLESAMLPHP_SECRETSALT'),
    'technicalcontact_name' => 'IT-gruppa',
    'technicalcontact_email' => 'it-gruppa@foreningenbs.no',
    'timezone' => 'Europe/Oslo',
    'session.cookie.name' => 'saml_billett_sid',
    'session.cookie.path' => '/',
    'session.cookie.secure' => false, // change to true when https is up
    'session.authtoken.cookiename' => 'SimpleSAMLAuthToken_billett',
    'language.default' => 'no',
));
