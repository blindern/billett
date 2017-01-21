<?php

$config = array(
    'admin' => array(
        'core:AdminPassword',
    ),

    'default-sp' => array(
        'saml:SP',
        'idp' => 'https://foreningenbs.no/simplesaml/saml2/idp/metadata.php'
    ),
);
