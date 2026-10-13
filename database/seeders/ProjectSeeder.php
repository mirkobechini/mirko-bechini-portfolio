<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Importa i progetti di partenza (quelli che stavano in projectsMeta.js (ora rimosso) e fallbackProjects.js).
 *
 * - Un progetto che manca viene creato con tutti i dati.
 * - Un progetto che esiste già (cercato senza distinguere maiuscole, come fa la sincronizzazione) e NON è
 *   mai stato rivisto (descrizione in italiano vuota, tipico di un progetto creato dalla sincronizzazione
 *   GitHub prima del seed) riceve solo i campi scritti a mano: titolo, descrizione, tipo, ambito,
 *   tecnologie extra, link live, in evidenza, nascosto. I dati di GitHub (repository, tecnologie, stelle,
 *   date) restano quelli della sincronizzazione.
 * - Un progetto già rivisto (con la descrizione compilata) non viene toccato: rilanciare il seed non
 *   cancella le modifiche fatte dal pannello.
 */
class ProjectSeeder extends Seeder
{
    /** Campi scritti a mano, gli unici che il seed compila su un progetto già creato dalla sincronizzazione. */
    private const CURATED_FIELDS = [
        'title',
        'description_it',
        'type',
        'scope',
        'extra_technologies',
        'live_url',
        'pinned',
        'hidden',
    ];

    public function run(): void
    {
        $projects = json_decode(
            file_get_contents(database_path('seeders/data/projects.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($projects as $data) {
            $existing = Project::query()
                ->whereRaw('lower(github_repo) = ?', [mb_strtolower($data['github_repo'])])
                ->first();

            if ($existing === null) {
                Project::create($data);

                continue;
            }

            if (blank($existing->description_it)) {
                $existing->update(array_intersect_key($data, array_flip(self::CURATED_FIELDS)));
            }
        }
    }
}
