<?php

// manually set the SERVER_PORT because simplesamlphp reads
// this instead of HTTP_HOST, and the Docker-build don't use port 80
if (isset($_SERVER['HTTP_HOST']) && ($pos = strpos($_SERVER['HTTP_HOST'], ":")) !== false) {
    $_SERVER['SERVER_PORT'] = substr($_SERVER['HTTP_HOST'], $pos + 1);
}

return array(
    'debug' => false,
    'dev' => false,
    'url' => 'https://billett.blindernuka.no/billett/',
);
