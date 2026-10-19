<?php

namespace App\Support\PdfPreview;

use App\Support\Uploads;
use Illuminate\Support\Str;

/**
 * Dal contenuto di un PDF all'immagine pubblicata sul sito: controlla il file, lo fa convertire, riduce
 * l'immagine (larghezza massima, WebP) e la salva sul disco degli upload. Il PDF non viene mai salvato:
 * sul sito arriva solo l'immagine della prima pagina, e nessuno può scaricare l'originale.
 */
class PdfPreviewImage
{
    /** Dimensione massima del PDF accettato. */
    public const MAX_BYTES = 10 * 1024 * 1024;

    /** Larghezza massima dell'immagine pubblicata (px): un attestato A4 resta leggibile e pesa poco. */
    public const MAX_WIDTH = 1600;

    /** Pixel massimi dell'immagine ricevuta dal convertitore: decodificarne di più esaurirebbe la memoria del server. */
    public const MAX_SOURCE_PIXELS = 25_000_000;

    public function __construct(private readonly PdfPreviewConverter $converter) {}

    /**
     * @param  string  $pdf  contenuto del file PDF
     * @param  string  $directory  cartella sul disco degli upload (es. "certifications/previews")
     * @return string percorso dell'immagine salvata, relativo al disco degli upload
     *
     * @throws PdfConversionFailed
     */
    public function store(string $pdf, string $directory): string
    {
        $this->assertLooksLikeAPdf($pdf);

        [$image, $extension] = $this->optimise($this->converter->convert($pdf));

        $path = trim($directory, '/').'/'.Str::uuid().'.'.$extension;

        if (! Uploads::disk()->put($path, $image, 'public')) {
            throw new PdfConversionFailed('Non sono riuscito a salvare l\'immagine.');
        }

        return $path;
    }

    private function assertLooksLikeAPdf(string $pdf): void
    {
        if (strlen($pdf) > self::MAX_BYTES) {
            throw new PdfConversionFailed('Il PDF è troppo grande (massimo 10 MB).');
        }

        // Ogni PDF comincia con "%PDF-": il tipo dichiarato dal browser non basta
        if (! str_starts_with($pdf, '%PDF-')) {
            throw new PdfConversionFailed('Il file non è un PDF valido.');
        }
    }

    /**
     * @return array{0: string, 1: string} contenuto e estensione ("webp" se il server la sa scrivere, altrimenti "png")
     */
    private function optimise(string $png): array
    {
        // Le dimensioni si leggono dall'intestazione, senza decodificare: prima di occupare memoria
        $size = @getimagesizefromstring($png);

        if ($size === false) {
            throw new PdfConversionFailed("L'immagine ricevuta non è leggibile.");
        }

        if ($size[0] * $size[1] > self::MAX_SOURCE_PIXELS) {
            throw new PdfConversionFailed('La pagina del PDF è troppo grande per essere convertita.');
        }

        $image = @imagecreatefromstring($png);

        if ($image === false) {
            throw new PdfConversionFailed('L\'immagine ricevuta non è leggibile.');
        }

        if (imagesx($image) > self::MAX_WIDTH) {
            $image = imagescale($image, self::MAX_WIDTH) ?: $image;
        }

        ob_start();

        if (function_exists('imagewebp')) {
            imagewebp($image, null, 85);
            $extension = 'webp';
        } else {
            imagepng($image, null, 9);
            $extension = 'png';
        }

        return [(string) ob_get_clean(), $extension];
    }
}
