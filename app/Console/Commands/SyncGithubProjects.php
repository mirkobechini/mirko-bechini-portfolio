<?php

namespace App\Console\Commands;

use App\GithubSync\SyncRunner;
use App\GithubSync\SyncSettings;
use Illuminate\Console\Command;

class SyncGithubProjects extends Command
{
    protected $signature = 'github:sync-projects {--force : Sincronizza anche se non è ancora "scaduta" (è quello che fa il pulsante del pannello)}';

    protected $description = 'Aggiorna dai repository pubblici di GitHub le stelle, le date e le tecnologie dei progetti';

    public function handle(SyncSettings $settings, SyncRunner $runner): int
    {
        // Lo scheduler lancia il comando ogni ora: parte davvero solo se la frequenza scelta lo richiede.
        if (! $this->option('force') && ! $settings->isDue()) {
            $this->components->info('Non è ancora il momento (frequenza: '.$settings->frequency()->getLabel().').');

            return self::SUCCESS;
        }

        $outcome = $runner->run();

        if (! $outcome['ok']) {
            $this->components->error($outcome['message']);

            return self::FAILURE;
        }

        $this->components->info('Sincronizzazione completata: '.$outcome['message'].'.');

        foreach ($outcome['result']->created as $name) {
            $this->line("  nuovo (nascosto): {$name}");
        }

        return self::SUCCESS;
    }
}
