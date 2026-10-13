<?php

namespace Database\Seeders;

use App\Models\FormationStep;
use Illuminate\Database\Seeder;

/**
 * Importa i passi di partenza della pagina "Percorso e prossimi step" (quelli che stavano in
 * bookshelfProfiles.js).
 *
 * Come gli altri seeder usa firstOrCreate (per colonna e titolo) e non sovrascrive le modifiche fatte
 * dal pannello.
 */
class FormationStepSeeder extends Seeder
{
    public function run(): void
    {
        $steps = json_decode(
            file_get_contents(database_path('seeders/data/formation_steps.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($steps as $data) {
            FormationStep::firstOrCreate(['kind' => $data['kind'], 'title' => $data['title']], $data);
        }
    }
}
