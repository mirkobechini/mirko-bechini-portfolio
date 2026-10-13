<?php

namespace App\Support;

use App\Models\Certification;
use App\Models\Course;

/**
 * Corsi (elenco e moduli) e certificazioni citano le skill per nome. Quando una skill viene rinominata o
 * eliminata devono seguirla, altrimenti il sito mostrerebbe un nome che non esiste più.
 */
class SkillNameReferences
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
     * Toglie il nome da corsi e certificazioni.
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

        Certification::query()->each(function (Certification $certification) use ($transform): void {
            $skills = $transform($certification->skills ?? []);

            if ($skills !== ($certification->skills ?? [])) {
                $certification->update(['skills' => $skills]);
            }
        });
    }
}
