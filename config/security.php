<?php

return [

    /*
    | Strict-Transport-Security. Di default disattivato perché su Cloudflare
    | si gestisce da SSL/TLS > Edge Certificates > HSTS. Attivare con SECURITY_HSTS=true
    | solo se non è già impostato lì.
    */
    'hsts' => (bool) env('SECURITY_HSTS', false),

    /*
    | Content-Security-Policy del sito pubblico (il pannello /admin ne è sempre escluso).
    |   enforce      il browser BLOCCA ciò che la policy non ammette (predefinito)
    |   report-only  il browser segnala le violazioni in console ma non blocca nulla
    | Se dopo un deploy qualcosa smette di funzionare (immagine, font, script di terze parti), basta
    | impostare SECURITY_CSP_MODE=report-only su Laravel Cloud per tornare in osservazione senza toccare il codice.
    | Qualsiasi altro valore vale come "enforce".
    */
    'csp_mode' => env('SECURITY_CSP_MODE', 'enforce'),

];
