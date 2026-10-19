<?php

namespace App\Support\PdfPreview;

/**
 * Trasforma la prima pagina di un PDF in un'immagine. Chi la implementa può usare strumenti diversi
 * (un servizio esterno, Imagick con Ghostscript...): il resto del sito non lo sa.
 */
interface PdfPreviewConverter
{
    /**
     * @param  string  $pdf  contenuto del file PDF
     * @return string contenuto di un'immagine PNG
     *
     * @throws PdfConversionFailed
     */
    public function convert(string $pdf): string;
}
