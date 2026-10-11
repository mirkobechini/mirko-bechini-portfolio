<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('app'));

// Qualsiasi altro URL: mostra comunque l'SPA (la NotFoundPage di React) ma con status 404
Route::fallback(fn () => response()->view('app', [], 404));
