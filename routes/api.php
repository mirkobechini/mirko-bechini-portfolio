<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

// API pubblica in sola lettura per il sito React. Prefisso /api (vedi bootstrap/app.php).
// Limite di 60 richieste al minuto per indirizzo IP.
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->name('api.projects.index');
});

// Qualsiasi altro GET sotto /api (compreso /api da solo): 404 in JSON, altrimenti lo prenderebbe la
// pagina d'errore dell'SPA.
Route::get('/', fn () => response()->json(['message' => 'Risorsa non trovata.'], 404));
Route::fallback(fn () => response()->json(['message' => 'Risorsa non trovata.'], 404));
