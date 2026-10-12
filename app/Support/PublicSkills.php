<?php

namespace App\Support;

use App\Http\Resources\PublicSkillResource;
use App\Models\Skill;
use Illuminate\Support\Facades\Cache;

/**
 * Le competenze come le vede il sito pubblico (non nascoste, in ordine), in cache.
 * Si svuota a ogni modifica di una skill o di un progetto (i titoli dei progetti collegati compaiono qui)
 * e dopo il salvataggio dal pannello, perché la relazione skill-progetti non passa dagli eventi del modello.
 */
class PublicSkills
{
    public const CACHE_KEY = 'api.skills.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $skills = Skill::query()->visible()->inDisplayOrder()
                ->with(['projects' => fn ($query) => $query->visible()->inDisplayOrder()])
                ->get();

            return ['data' => PublicSkillResource::collection($skills)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
