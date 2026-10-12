<?php

namespace App\GithubSync;

use Illuminate\Http\Client\Response;
use RuntimeException;

/**
 * Errore della GitHub API con un messaggio già leggibile (è quello che si vede nel pannello).
 */
class GithubApiException extends RuntimeException
{
    public static function fromResponse(Response $response, bool $usedToken): self
    {
        $status = $response->status();

        if ($status === 401) {
            return new self('GitHub ha rifiutato il token (401): è scaduto o non valido. Creane uno nuovo e aggiorna GITHUB_TOKEN.');
        }

        $rateLimited = $response->header('X-RateLimit-Remaining') === '0' || $status === 429;

        if ($rateLimited && in_array($status, [403, 429], true)) {
            $reset = $response->header('X-RateLimit-Reset');
            $when = is_numeric($reset) ? ' Riprova dopo le '.date('H:i', (int) $reset).'.' : '';
            $hint = $usedToken ? '' : ' Senza token il limite è di 60 richieste all\'ora: aggiungi GITHUB_TOKEN.';

            return new self("Limite di richieste di GitHub raggiunto.{$when}{$hint}");
        }

        if ($status === 404) {
            return new self('Utente GitHub non trovato (404): controlla GITHUB_USERNAME.');
        }

        return new self("GitHub ha risposto con un errore ({$status}).");
    }
}
