<?php namespace Blindern\UKA\Billett\Auth;

class Guard extends \Illuminate\Auth\Guard {
    /**
     * Temporary solution
     */
    protected static $allowed = array(
        'henrste', // ikt 2017/systemansvarlig
        'vegardan', // web 2017
        'majaft', // billettsjef 2019
        'skbj004', // billettsjef 2023
        'kjetilk', // IKT-ansvarlig 2023
        'hcloeven', // Nestsjef Okonomi 2023

        // UKEstyret 2023
        'cmnilsen',
        'emilchri',
        'emsk010',
        'fionask',
        'marireim',
        'olemfr',
        'sindrec',
        'waldemarrg',

        // UKEstyret 2025
        'annearonsen',
        'henrikrc',
        'haakonfrankrig',
        'haavbro',
        'jannedahl',
        'jennybta',
        'sofiejanilsen',
        'vvolleng',

        // billettgruppa 2023
        // ...
    );

    /**
     * Simple ACL check
     *
     * Check if we have access to a specific role
     *
     * @param string $role Name of role
     * @return boolean
     */
    public function hasRole($role)
    {
        $user = $this->user();

        // TODO: this is only temporary
        if ($user && in_array($user->username, static::$allowed))
        {
            return true;
        }

        return false;
    }

    /**
     * Get list over roles user have access to
     */
    public function getRoles()
    {
        if ($this->hasRole('all')) {
            return array('all');
        }

        return array();
    }

}
