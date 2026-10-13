<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Sincronizzazione dei progetti con GitHub: il controllo è orario, ma il comando parte davvero solo
// quando la frequenza scelta nel pannello (di partenza: settimanale) lo richiede.
// Su Laravel Cloud serve attivare lo scheduler dell'ambiente.
Schedule::command('github:sync-projects')->hourly()->withoutOverlapping();
