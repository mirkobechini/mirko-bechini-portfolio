<?php

namespace App\Support\PdfPreview;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
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

        $id = $upload->successful() ? $upload->json('id') : null;

        if (! is_string($id) || $id === '') {
            throw new PdfConversionFailed('Il servizio di conversione non ha accettato il PDF.');
        }

        try {
            $export = $this->http($token)->accept('image/png')->post("/pdfs/{$id}/export?fmt=png");

            $this->failIfUnauthorized($export);

            if (! $export->successful() || ! str_starts_with($export->body(), self::PNG_SIGNATURE)) {
                throw new PdfConversionFailed('Il servizio di conversione non ha restituito un\'immagine.');
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
        $token = $response->successful() ? $response->json('access_token') : null;

        if (! is_string($token) || $token === '') {
            throw new PdfConversionFailed('Il servizio di conversione non ha concesso l\'accesso.');
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
