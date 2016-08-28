<?php

// manually set the SERVER_PORT because simplesamlphp reads
// this instead of HTTP_HOST, and the Docker-build don't use port 80
if (isset($_SERVER['HTTP_HOST']) && ($pos = strpos($_SERVER['HTTP_HOST'], ":")) !== false) {
    $_SERVER['SERVER_PORT'] = substr($_SERVER['HTTP_HOST'], $pos + 1);
}

return array(
    'debug' => true,
    'dev' => true,
    'url' => 'http://localhost:8081/billett/',
);
