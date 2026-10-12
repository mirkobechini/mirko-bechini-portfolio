<?php

namespace App\GithubSync;

use App\Models\Project;
use App\Support\TechnologyList;
use Illuminate\Support\Facades\DB;

/**
 * Porta nel database i dati letti da GitHub.
 *
 * Regole (decise in FUTURE-PLAN.md):
 * - un progetto esistente aggiorna SOLO i campi di GitHub: stelle, data dell'ultimo push, indirizzo del
 *   repository e tecnologie (linguaggio + topics). Titolo, descrizione, categoria, ambito, sito online,
 *   tecnologie aggiuntive, raggruppamento, "in evidenza" e "nascosto" restano quelli del pannello.
 * - un repository nuovo viene creato NASCOSTO, da rivedere nel pannello prima di mostrarlo sul sito.
 * - un progetto il cui repository non c'è più su GitHub non viene toccato.
 */
class ProjectSyncer
{
    /**
     * @param  list<array<string, mixed>>  $repos  repository normalizzati da GithubClient
     */
    public function sync(array $repos, int $skipped = 0): SyncResult
    {
        return DB::transaction(function () use ($repos, $skipped): SyncResult {
            // GitHub non distingue maiuscole e minuscole nei nomi dei repository: nemmeno noi.
            $existing = Project::all()->keyBy(fn (Project $project): string => mb_strtolower($project->github_repo));

            $created = [];
            $updated = [];
            $unchanged = 0;

            foreach ($repos as $repo) {
                $githubData = [
                    'repo_url' => $repo['html_url'],
                    'technologies' => $this->technologies($repo),
                    'stars' => $repo['stars'],
                    'pushed_at' => $repo['pushed_at'],
                ];

                $project = $existing->get(mb_strtolower($repo['name']));

                if ($project === null) {
                    Project::create($githubData + [
                        'github_repo' => $repo['name'],
                        'title' => $repo['name'],
                        'live_url' => $this->validUrl($repo['homepage'] ?? null),
                        'hidden' => true,
                        'synced_at' => now(),
                    ]);
                    $created[] = $repo['name'];

                    continue;
                }

                $project->fill($githubData);
                $changed = $project->isDirty();
                $project->synced_at = now();
                $project->save();

                if ($changed) {
                    $updated[] = $project->github_repo;
                } else {
                    $unchanged++;
                }
            }

            return new SyncResult($created, $updated, $unchanged, $skipped);
        });
    }

    /**
     * Linguaggio principale + topics, senza doppioni (anche se cambiano le maiuscole).
     *
     * @param  array<string, mixed>  $repo
     * @return list<string>
     */
    private function technologies(array $repo): array
    {
        return TechnologyList::merge([$repo['language'] ?? null], $repo['topics'] ?? []);
    }

    private function validUrl(mixed $url): ?string
    {
        if (! is_string($url) || $url === '') {
            return null;
        }

        return filter_var($url, FILTER_VALIDATE_URL) && preg_match('#^https?://#i', $url) ? $url : null;
    }
}
