<?php

return array(

    /*
    |--------------------------------------------------------------------------
    | laravel-saml config file
    |--------------------------------------------------------------------------
    |
    | Here you need to specify a working phpsimplesaml install working as
    | a Service Provider already connected (or acting like) a Identity provider
    |
    */


    /*
     * The path to the working phpsimplesaml install
     */
    'sp_path' => __DIR__."/../../../../../../simplesamlphp",

    /*
     * The service provider name
     */
    'sp_name' => "default-sp",

    /*
     * The redirect destination after logging out
     */
    'logout_target' => url(),

    /*
     * Internal id property, defaults to email.
     * The property to identify users by in the system.
     * 'internal_id_property' => 'email',
     */
    'internal_id_property' => 'username',

    /*
     * Saml id property defaults to email, the property
     * in the saml packet which should be mapped to the
     * internal id property.
     * 'saml_id_property' => 'email',
     */
    'saml_id_property' => 'username',

    /*
     * object_mappings.
     * an array of string with string keys.
     * Key is a value on your User object, value is the
     * SAML value that this is mapped to.
     * When user is created these values will be copied
     * to your user object.
     *
     * 'object_mappings' => [
     *  'email' => 'email',
     * ],
     */
    'object_mappings' => [
        'id' => 'id',
        'username' => 'username',
        'email' => 'email',
        'realname' => 'realname',
    ],

    /*
     * can_create and can_create_error.
     * If you don't want users to be created via saml set can_create to false.
     * They will then be presented with an error and the value of can_create_error.
     * 'can_create' => false,
     * 'can_create_error' => 'You can not register on this system.',
     */
    'can_create' => true
);
