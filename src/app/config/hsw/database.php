<?php

return array(

    'default' => 'mysql',

    'connections' => array(

        'mysql' => array(
            'driver'    => 'mysql',
            'host'      => '10.8.0.1',
            'database'  => 'uka_billett',
            'username'  => 'uka_billett',
            'password'  => $_ENV['BILLETT_MYSQL_PASS'],
            'charset'   => 'utf8',
            'collation' => 'utf8_unicode_ci',
            'prefix'    => '',
        ),
    ),

);
