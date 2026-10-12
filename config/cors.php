<?php

return [

    // Il sito legge l'API dalla stessa origine, quindi nessun percorso espone header CORS:
    // altri siti non possono leggerla dal browser. (Il default di Laravel apriva /api/* a tutti.)
    'paths' => [],

    'allowed_methods' => ['GET'],

    'allowed_origins' => [],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
