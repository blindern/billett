<?php namespace Blindern\UKA\Billett\Auth;

class Guard extends \Illuminate\Auth\Guard {
    /**
     * Temporary solution
     */
    protected static $allowed = array(
        'henrste', // ikt 2017/systemansvarlig
        'vegardan', // web 2017
        'kristinaca', // booking 2017

        // UKEstyret 2017
        'marthhsa',
        'bjornreu',
        'linestandalsoernes',
        'trygvels',
        'miaemilie',
        'grieglet',
        'sebastwi',
        'tirilskaardal',

        'bfesche', // kjellerøkonomi 2017
        'stianval', // billettsjef 2017
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
