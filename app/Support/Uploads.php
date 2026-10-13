<?php

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

/**
 * File caricati dal pannello (icone, attestati, anteprime). Stanno sul disco `filesystems.uploads_disk`:
 * `public` in locale, un disco persistente (bucket) in produzione.
 */
class Uploads
{
    /** Tipi accettati: niente SVG, che servito dal nostro dominio potrebbe eseguire script. */
    public const IMAGE_TYPES = ['image/png', 'image/webp', 'image/jpeg'];

    public static function diskName(): string
    {
        return (string) config('filesystems.uploads_disk');
    }

    public static function disk(): Filesystem
    {
        return Storage::disk(self::diskName());
    }

    public static function url(?string $path): ?string
    {
        return $path ? self::disk()->url($path) : null;
    }

    public static function delete(?string $path): void
    {
        if ($path) {
            self::disk()->delete($path);
        }
    }

    /**
     * Larghezza e altezza dell'immagine caricata, se leggibili.
     *
     * @return array{0: int, 1: int}|null
     */
    public static function imageSize(?string $path): ?array
    {
        if (! $path || ! self::disk()->exists($path)) {
            return null;
        }

        $size = @getimagesizefromstring((string) self::disk()->get($path));

        return $size === false ? null : [(int) $size[0], (int) $size[1]];
    }
}
