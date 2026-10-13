<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Importa i progetti di partenza (quelli che stavano in projectsMeta.js (ora rimosso) e fallbackProjects.js).
 *
 * Usa firstOrCreate: crea solo i progetti che mancano e NON sovrascrive mai quello che è già nel
 * database. Così rilanciarlo non cancella le modifiche fatte dal pannello.
 */
class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $projects = json_decode(
            file_get_contents(database_path('seeders/data/projects.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($projects as $project) {
            Project::firstOrCreate(
                ['github_repo' => $project['github_repo']],
                $project,
            );
        }
    }
}
