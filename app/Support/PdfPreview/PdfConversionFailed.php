<?php

namespace App\Support\PdfPreview;

use RuntimeException;

/**
 * La conversione di un PDF in immagine non è riuscita. Il messaggio è scritto per chi usa il pannello
 * (in italiano, senza dettagli tecnici): viene mostrato in una notifica.
 */
class PdfConversionFailed extends RuntimeException {}
