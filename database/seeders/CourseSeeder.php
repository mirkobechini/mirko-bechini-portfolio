<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

/**
 * Importa i corsi di partenza (quelli che stavano in educationData.js).
 *
 * Come gli altri seeder usa firstOrCreate (per nome del corso): crea solo ciò che manca e non
 * sovrascrive le modifiche fatte dal pannello.
 */
class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = json_decode(
            file_get_contents(database_path('seeders/data/courses.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($courses as $data) {
            Course::firstOrCreate(['course' => $data['course']], $data);
        }
    }
}
