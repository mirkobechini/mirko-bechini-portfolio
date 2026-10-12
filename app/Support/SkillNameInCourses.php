<?php

namespace App\Support;

use App\Models\Course;

/**
 * I corsi citano le skill per nome (nell'elenco del corso e in ogni modulo). Quando una skill viene
 * rinominata o eliminata, i corsi devono seguirla, altrimenti il sito mostrerebbe un nome che non esiste più.
 */
class SkillNameInCourses
{
    /**
     * Sostituisce il vecchio nome con il nuovo (senza creare doppioni).
     */
    public static function rename(string $old, string $new): void
    {
        self::apply(fn (array $names): array => array_values(array_unique(
            array_map(fn (string $name): string => $name === $old ? $new : $name, $names)
        )));
    }

    /**
     * Toglie il nome dai corsi.
     */
    public static function remove(string $name): void
    {
        self::apply(fn (array $names): array => array_values(array_filter($names, fn (string $n): bool => $n !== $name)));
    }

    /**
     * @param  callable(array<int, string>): array<int, string>  $transform
     */
    private static function apply(callable $transform): void
    {
        Course::query()->each(function (Course $course) use ($transform): void {
            $skills = $transform($course->skills ?? []);
            $modules = array_map(
                fn (array $module): array => array_replace($module, ['skills' => $transform($module['skills'] ?? [])]),
                $course->modules ?? [],
            );

            if ($skills !== ($course->skills ?? []) || $modules !== ($course->modules ?? [])) {
                $course->update(['skills' => $skills, 'modules' => $modules]);
            }
        });
    }
}
