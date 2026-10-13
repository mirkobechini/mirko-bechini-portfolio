<?php

namespace App\Support;

use App\Http\Resources\PublicCertificationResource;
use App\Models\Certification;
use Illuminate\Support\Facades\Cache;

/**
 * Gli attestati come li vede il sito pubblico (non nascosti, in ordine), in cache. Vedi PublicCache per
 * l'invalidazione.
 */
class PublicCertifications
{
    public const CACHE_KEY = 'api.certifications.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $certifications = Certification::query()->visible()->inDisplayOrder()->get();

            return ['data' => PublicCertificationResource::collection($certifications)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
