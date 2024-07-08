<?php

namespace Blindern\UKA\Billett\Helpers;

/**
 * Exception for the situation when we try to create the same Vipps
 * session another time, which we have not built support for.
 */
class DuplicateSessionException extends \Exception {}
