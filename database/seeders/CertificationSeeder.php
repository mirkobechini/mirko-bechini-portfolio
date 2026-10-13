<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\Course;
use Illuminate\Database\Seeder;

/**
 * Importa gli attestati di partenza (quelli che stavano in certificationData.js).
 *
 * Come gli altri seeder usa firstOrCreate (per titolo) e non sovrascrive le modifiche fatte dal pannello.
 * Il corso collegato si cerca per titolo: va lanciato dopo CourseSeeder.
 */
class CertificationSeeder extends Seeder
{
    public function run(): void
    {
        $certifications = json_decode(
            file_get_contents(database_path('seeders/data/certifications.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        foreach ($certifications as $data) {
            $courseTitle = $data['course'] ?? null;
            unset($data['course']);

            $data['course_id'] = $courseTitle === null ? null : Course::where('course', $courseTitle)->value('id');

            Certification::firstOrCreate(['title' => $data['title']], $data);
        }
    }
}
