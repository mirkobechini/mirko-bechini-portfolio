<?php

namespace App\Providers;

use App\Support\PdfPreview\PdfEditorConverter;
use App\Support\PdfPreview\PdfPreviewConverter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Chi converte i PDF in immagine: oggi PdfEditor; per cambiare strumento basta un'altra implementazione
        $this->app->bind(PdfPreviewConverter::class, PdfEditorConverter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
