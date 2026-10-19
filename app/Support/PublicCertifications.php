<?php

namespace App\Support;

use App\Http\Resources\PublicCertificationResource;
use App\Models\Certification;
use Illuminate\Support\Facades\Cache;

/**
 * Gli attestati come li vede il sito pubblico (non nascosti, in ordine, con un'immagine), in cache. Quelli dei
 * corsi completati ci sono già: sono righe vere create da CourseCertificateSync. Vedi PublicCache per
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
            // Senza immagine (né caricata né scritta a mano) una certificazione sulla galleria sarebbe una tessera vuota
            $certifications = Certification::query()->visible()->inDisplayOrder()->get()
                ->filter(fn (Certification $certification): bool => filled($certification->previewUrl()))
                ->values();

            return ['data' => PublicCertificationResource::collection($certifications)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
