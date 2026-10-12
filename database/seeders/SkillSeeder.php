<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Skill;
use Illuminate\Database\Seeder;

/**
 * Importa le competenze di partenza (quelle che stavano in skillsData.js).
 *
 * Come ProjectSeeder usa firstOrCreate: crea solo ciò che manca e non sovrascrive le modifiche fatte dal
 * pannello. I progetti collegati vengono cercati per titolo (senza distinguere maiuscole): quelli trovati
 * diventano una relazione, gli altri (es. "Tutti i progetti") restano come testo libero.
 * Va lanciato dopo ProjectSeeder.
 */
class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = json_decode(
            file_get_contents(database_path('seeders/data/skills.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        $projectsByTitle = Project::query()->get()->keyBy(fn (Project $project) => mb_strtolower($project->title));

        foreach ($skills as $data) {
            $related = $data['related_projects'] ?? [];
            unset($data['related_projects']);

            $skill = Skill::firstOrCreate(['name' => $data['name']], $data);

            if (! $skill->wasRecentlyCreated) {
                continue;
            }

            $linked = [];
            $extra = [];
            foreach ($related as $title) {
                $project = $projectsByTitle->get(mb_strtolower($title));
                $project ? $linked[] = $project->id : $extra[] = $title;
            }

            $skill->projects()->sync($linked);
            $skill->update(['extra_projects' => $extra]);
        }
    }
}
