<?php

return array(
    'driver' => 'sendmail',
    'from' => array('address' => "billett@blindernuka.no", 'name' => "UKA på Blindern"),
    'sendmail' => '/usr/sbin/sendmail -bs',
);
