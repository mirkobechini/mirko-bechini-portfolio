<?php

namespace App\Support;

use App\Http\Resources\PublicProjectResource;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;

/**
 * I progetti come li vede il sito pubblico (non nascosti, nell'ordine di visualizzazione), in cache.
 *
 * La cache si svuota da sola a ogni modifica di un progetto o di un raggruppamento (vedi i modelli);
 * la scadenza breve è una rete di sicurezza per le modifiche che non passano dai modelli
 * (per esempio un aggiornamento diretto sul database).
 */
class PublicProjects
{
    public const CACHE_KEY = 'api.projects.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $projects = Project::query()->visible()->inDisplayOrder()->with(['group:id,name', 'course:id,course'])->get();

            return ['data' => PublicProjectResource::collection($projects)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
