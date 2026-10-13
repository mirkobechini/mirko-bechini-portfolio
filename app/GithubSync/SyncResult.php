<?php

namespace App\GithubSync;

/**
 * Esito di una sincronizzazione.
 */
final readonly class SyncResult
{
    /**
     * @param  list<string>  $created  repository nuovi (creati nascosti)
     * @param  list<string>  $updated  progetti esistenti i cui dati di GitHub sono cambiati
     */
    public function __construct(
        public array $created = [],
        public array $updated = [],
        public int $unchanged = 0,
        public int $skipped = 0,
    ) {}

    public function summary(): string
    {
        $parts = [
            count($this->created).' nuovi (creati nascosti)',
            count($this->updated).' aggiornati',
            $this->unchanged.' invariati',
        ];

        if ($this->skipped > 0) {
            $parts[] = $this->skipped.' ignorati (fork o archiviati)';
        }

        return implode(', ', $parts);
    }
}
