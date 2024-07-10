<?php

function format_nok($num)
{
    return 'NOK '.number_format($num, 0, ',', ' ');
}
