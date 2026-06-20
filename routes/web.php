<?php

use Illuminate\Support\Facades\Route;

// Catch-all route: tutte le richieste non-API vengono gestite dall'SPA React
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
