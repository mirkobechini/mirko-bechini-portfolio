<?php

namespace App\Support;

use App\Http\Resources\PublicFormationStepResource;
use App\Models\FormationStep;
use Illuminate\Support\Facades\Cache;

/**
 * I passi del percorso come li vede il sito pubblico (non nascosti, in ordine), in cache. Vedi PublicCache
 * per l'invalidazione.
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

            return ['data' => PublicFormationStepResource::collection($steps)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
