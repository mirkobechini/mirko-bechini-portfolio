<?php

return [

    /*
    | Strict-Transport-Security. Di default disattivato perché su Cloudflare
    | si gestisce da SSL/TLS > Edge Certificates > HSTS. Attivare con SECURITY_HSTS=true
    | solo se non è già impostato lì.
    */
    'hsts' => (bool) env('SECURITY_HSTS', false),

];
