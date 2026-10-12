<?php

namespace App\Support;

use App\Http\Resources\PublicCourseResource;
use App\Models\Course;
use Illuminate\Support\Facades\Cache;

/**
 * I corsi come li vede il sito pubblico (non nascosti, in ordine), in cache. Vedi PublicCache per
 * l'invalidazione.
 */
class PublicCourses
{
    public const CACHE_KEY = 'api.courses.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $courses = Course::query()->visible()->inDisplayOrder()
                ->with(['projects' => fn ($query) => $query->visible()->inDisplayOrder()])
                ->get();

            return ['data' => PublicCourseResource::collection($courses)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
