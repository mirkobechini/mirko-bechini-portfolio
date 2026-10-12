<?php

namespace App\GithubSync;

use Throwable;

/**
 * Esegue una sincronizzazione completa (legge GitHub, aggiorna i progetti) e ne registra l'esito.
 * La usano sia il comando `github:sync-projects` sia il pulsante "Sincronizza ora" del pannello.
 */
class SyncRunner
{
    public function __construct(
        private readonly GithubClient $github,
        private readonly ProjectSyncer $syncer,
        private readonly SyncSettings $settings,
    ) {}

    /**
     * @return array{ok: bool, message: string, result: SyncResult|null}
     */
    public function run(): array
    {
        try {
            $fetched = $this->github->publicRepositories();
            $result = $this->syncer->sync($fetched['repos'], $fetched['skipped']);
        } catch (GithubApiException $e) {
            $this->settings->recordFailure($e->getMessage());

            return ['ok' => false, 'message' => $e->getMessage(), 'result' => null];
        } catch (Throwable $e) {
            report($e);
            $message = 'Errore imprevisto durante la sincronizzazione: '.$e->getMessage();
            $this->settings->recordFailure($message);

            return ['ok' => false, 'message' => $message, 'result' => null];
        }

        $this->settings->recordSuccess($result);

        return ['ok' => true, 'message' => $result->summary(), 'result' => $result];
    }
}
