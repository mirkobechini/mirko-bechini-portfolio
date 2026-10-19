<?php

namespace App\Support\PdfPreview;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Converte i PDF con il backend di PdfEditor (pdfeditor-api.mirkobechini.com, FastAPI + PyMuPDF), che sa
 * esportare un PDF in PNG. Il giro è: accesso ospite → caricamento → esportazione in PNG → cancellazione.
 *
 * Il PDF resta su quel servizio solo per il tempo della conversione e viene cancellato subito dopo, anche
 * se l'esportazione fallisce. L'accesso ospite si riusa finché non scade, per non creare un account
 * temporaneo a ogni conversione.
 */
class PdfEditorConverter implements PdfPreviewConverter
{
    /** Cloudflare davanti all'API blocca gli User-Agent predefiniti dei linguaggi: ci si presenta con un nome. */
    public const USER_AGENT = 'MirkoPortfolio/1.0 (+https://mirkobechini.com)';

    private const TOKEN_CACHE_KEY = 'pdfeditor.guest-token';

    private const PNG_SIGNATURE = "\x89PNG\r\n\x1a\n";

    public function convert(string $pdf): string
    {
        try {
            try {
                return $this->convertWithToken($pdf, $this->token());
            } catch (ExpiredGuestToken) {
                // Il token in cache era scaduto o revocato: un nuovo accesso ospite e un solo altro tentativo
                Cache::forget(self::TOKEN_CACHE_KEY);

                return $this->convertWithToken($pdf, $this->token());
            }
        } catch (ConnectionException) {
            throw new PdfConversionFailed('Il servizio di conversione non risponde.');
        } catch (ExpiredGuestToken) {
            throw new PdfConversionFailed('Il servizio di conversione ha rifiutato l\'accesso.');
        }
    }

    private function convertWithToken(string $pdf, string $token): string
    {
        $upload = $this->http($token)
            ->attach('file', $pdf, 'attestato.pdf', ['Content-Type' => 'application/pdf'])
            ->post('/pdfs/upload');

        $this->failIfUnauthorized($upload);

        if (! $upload->successful()) {
            throw $this->failure($upload, 'Il servizio di conversione non ha accettato il PDF', 'caricamento');
        }

        $id = $upload->json('id');

        if (! is_string($id) || $id === '') {
            throw new PdfConversionFailed('Il servizio di conversione non ha accettato il PDF (risposta non valida).');
        }

        try {
            $export = $this->http($token)->accept('image/png')->post("/pdfs/{$id}/export?fmt=png");

            $this->failIfUnauthorized($export);

            if (! $export->successful()) {
                throw $this->failure($export, "Il servizio di conversione non ha restituito un'immagine", 'esportazione');
            }

            if (! str_starts_with($export->body(), self::PNG_SIGNATURE)) {
                throw new PdfConversionFailed("Il servizio di conversione non ha restituito un'immagine (risposta non valida).");
            }

            return $export->body();
        } finally {
            $this->deleteQuietly($token, $id);
        }
    }

    private function http(?string $token = null): PendingRequest
    {
        $request = Http::baseUrl((string) config('services.pdfeditor.url'))
            ->withUserAgent(self::USER_AGENT)
            ->acceptJson()
            ->connectTimeout(10)
            ->timeout((int) config('services.pdfeditor.timeout', 45));

        return $token === null ? $request : $request->withToken($token);
    }

    /**
     * Errore con il motivo in chiaro (codice di risposta) e il dettaglio nel log: serve a capire cosa non va
     * quando la conversione funziona dal computer di sviluppo ma non dal server di produzione
     * (limite di richieste, protezione di Cloudflare, servizio in difficoltà).
     */
    private function failure(Response $response, string $what, string $step): PdfConversionFailed
    {
        Log::warning("PdfEditor: {$step} non riuscito", [
            'status' => $response->status(),
            'body' => mb_substr(trim(strip_tags($response->body())), 0, 200),
            'cf_mitigated' => $response->header('cf-mitigated'),
        ]);

        $reason = match ($response->status()) {
            429 => 'troppe richieste, riprova tra qualche minuto',
            403 => 'richiesta bloccata, codice 403',
            default => 'codice '.$response->status(),
        };

        return new PdfConversionFailed("{$what} ({$reason}).");
    }

    private function failIfUnauthorized(Response $response): void
    {
        if ($response->status() === 401) {
            throw new ExpiredGuestToken;
        }
    }

    /**
     * Accesso ospite riusato fino a poco prima della scadenza scritta nel token stesso.
     */
    private function token(): string
    {
        $cached = Cache::get(self::TOKEN_CACHE_KEY);

        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $response = $this->http()->withBody('{}', 'application/json')->post('/auth/guest');

        if (! $response->successful()) {
            throw $this->failure($response, "Il servizio di conversione non ha concesso l'accesso", 'accesso ospite');
        }

        $token = $response->json('access_token');

        if (! is_string($token) || $token === '') {
            throw new PdfConversionFailed("Il servizio di conversione non ha concesso l'accesso (risposta non valida).");
        }

        $ttl = $this->secondsLeft($token) - 120; // un margine, per non usare un token sul punto di scadere

        if ($ttl > 0) {
            Cache::put(self::TOKEN_CACHE_KEY, $token, $ttl);
        }

        return $token;
    }

    /**
     * Secondi che mancano alla scadenza (campo "exp" del JWT); 0 se non si riesce a leggerla.
     */
    private function secondsLeft(string $jwt): int
    {
        $payload = explode('.', $jwt)[1] ?? '';
        $json = base64_decode(strtr($payload, '-_', '+/'), true);
        $exp = is_string($json) ? (json_decode($json, true)['exp'] ?? null) : null;

        return is_int($exp) ? max(0, $exp - time()) : 0;
    }

    private function deleteQuietly(string $token, string $id): void
    {
        try {
            $this->http($token)->delete("/pdfs/{$id}");
        } catch (Throwable) {
            // La cancellazione è una pulizia: se fallisce non deve far fallire la conversione già riuscita
        }
    }
}
