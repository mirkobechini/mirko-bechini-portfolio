<?php

namespace App\Support;

use App\Http\Resources\PublicContactResource;
use App\Models\Contact;
use Illuminate\Support\Facades\Cache;

/**
 * I contatti come li vede il sito pubblico (non nascosti, in ordine), in cache. Vedi PublicCache per
 * l'invalidazione.
 */
class PublicContacts
{
    public const CACHE_KEY = 'api.contacts.v1';

    public const TTL_SECONDS = 600;

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, function (): array {
            $contacts = Contact::query()->visible()->inDisplayOrder()->get();

            return ['data' => PublicContactResource::collection($contacts)->resolve()];
        });
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
