<?php

use App\Http\Controllers\Api\AboutController;
use App\Http\Controllers\Api\CertificationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\FormationStepController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use Illuminate\Support\Facades\Route;

// API pubblica in sola lettura per il sito React. Prefisso /api (vedi bootstrap/app.php).
// Limite di 60 richieste al minuto per indirizzo IP.
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index'])->name('api.projects.index');
    Route::get('/skills', [SkillController::class, 'index'])->name('api.skills.index');
    Route::get('/education', [CourseController::class, 'index'])->name('api.education.index');
    Route::get('/certifications', [CertificationController::class, 'index'])->name('api.certifications.index');
    Route::get('/formation-steps', [FormationStepController::class, 'index'])->name('api.formation-steps.index');
    Route::get('/contacts', [ContactController::class, 'index'])->name('api.contacts.index');
    Route::get('/about', [AboutController::class, 'show'])->name('api.about.show');
});

// Qualsiasi altro GET sotto /api (compreso /api da solo): 404 in JSON, altrimenti lo prenderebbe la
// pagina d'errore dell'SPA.
Route::get('/', fn () => response()->json(['message' => 'Risorsa non trovata.'], 404));
Route::fallback(fn () => response()->json(['message' => 'Risorsa non trovata.'], 404));
