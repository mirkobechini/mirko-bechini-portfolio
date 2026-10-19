<?php

namespace App\Support\PdfPreview;

use RuntimeException;

/**
 * Il servizio di conversione ha risposto 401: l'accesso ospite non è più valido. Interna a PdfEditorConverter.
 */
class ExpiredGuestToken extends RuntimeException {}
