<?php

namespace App\Support;

use App\Enums\CourseStatus;
use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use App\Http\Resources\PublicFormationStepResource;
use App\Models\Course;
use App\Models\FormationStep;
use Illuminate\Support\Facades\Cache;

/**
 * I passi della pagina "Percorso e prossimi step" come li vede il sito pubblico, in cache. Vedi PublicCache
 * per l'invalidazione.
 *
 * - "Focus attuale" si compila da solo con i corsi in corso o in sospeso (dal più recente), seguiti dai
 *   passi scritti a mano nella stessa colonna. Un corso completato, o un passo segnato "Completato",
 *   esce dal Focus senza altre modifiche.
 * - Un passo scritto a mano con lo stesso titolo di un corso del Focus non si ripete: vale il corso.
 * - "Roadmap" sono solo i passi scritti a mano, anche quelli completati (restano come traccia).
 * - Passi e corsi nascosti non compaiono.
 */
class PublicFormationSteps
{
    public const CACHE_KEY = 'api.formation-steps.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $steps = FormationStep::query()->visible()->inDisplayOrder()->get();

            $courseFocus = self::focusFromCourses();
            $courseTitles = array_map(fn (array $item): string => mb_strtolower($item['title']), $courseFocus);

            $manualFocus = $steps
                ->where('kind', FormationStepKind::Focus)
                ->reject(fn (FormationStep $step): bool => $step->status === FormationStepStatus::Done)
                ->reject(fn (FormationStep $step): bool => in_array(mb_strtolower($step->title), $courseTitles, true));

            return ['data' => [
                ...$courseFocus,
                ...PublicFormationStepResource::collection($manualFocus)->resolve(),
                ...PublicFormationStepResource::collection($steps->where('kind', FormationStepKind::Roadmap))->resolve(),
            ]];
        });
    }

    /**
     * I corsi in corso o in sospeso, già nella forma dei passi del Focus.
     *
     * @return list<array<string, mixed>>
     */
    private static function focusFromCourses(): array
    {
        return Course::query()
            ->visible()
            ->whereIn('status', collect(CourseStatus::cases())->filter->isOngoing()->map->value->all())
            ->inDisplayOrder()
            ->get()
            ->map(fn (Course $course): array => [
                // Testo, non numero: non si confonde con l'id di un passo scritto a mano
                'id' => 'course-'.$course->id,
                'kind' => FormationStepKind::Focus->value,
                'title' => $course->course,
                'description' => $course->description,
                'status' => $course->status->value,
                'badge' => $course->organization,
            ])
            ->all();
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
