<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Risposta JSON pubblica con ETag e Cache-Control: browser e cache di rete possono riusarla per poco e
 * rivalidarla con If-None-Match (304, senza corpo).
 *
 * Le attese sono brevi di proposito (un minuto): davanti al sito c'è una cache di rete (quella di Laravel
 * Cloud) che rispetta s-maxage, e le modifiche fatte dal pannello devono comparire in fretta. Il carico
 * sul database resta basso grazie alla cache lato server (PublicCache).
 */
trait RespondsWithCachedJson
{
    /** Secondi di validità per browser e cache di rete. */
    public const PUBLIC_MAX_AGE = 60;

    /** Secondi in cui si può servire una copia scaduta mentre se ne prepara una nuova. */
    public const PUBLIC_STALE_WHILE_REVALIDATE = 30;

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function cachedJson(Request $request, array $payload): JsonResponse
    {
        $response = response()->json($payload);

        $response->setEtag(md5((string) $response->getContent()));
        $response->setCache([
            'public' => true,
            'max_age' => self::PUBLIC_MAX_AGE,
            's_maxage' => self::PUBLIC_MAX_AGE,
            'stale_while_revalidate' => self::PUBLIC_STALE_WHILE_REVALIDATE,
        ]);
        $response->isNotModified($request);

        return $response;
    }
}
