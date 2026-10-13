<?php

namespace App\Models;

use App\Models\Concerns\CleansUpUploads;
use App\Support\PublicCache;
use App\Support\Uploads;
use Database\Factories\CertificationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un attestato mostrato nella galleria "Certificazioni". Può puntare a un corso: cliccandolo il sito
 * apre il libro "Formazione" su quel corso.
 */
class Certification extends Model
{
    /** @use HasFactory<CertificationFactory> */
    use CleansUpUploads;

    use HasFactory;

    protected $fillable = [
        'title',
        'preview',
        'preview_upload',
        'preview_width',
        'preview_height',
        'link',
        'organization',
        'organization_url',
        'skills',
        'course_id',
        'position',
        'hidden',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'preview_width' => 'integer',
            'preview_height' => 'integer',
            'position' => 'integer',
            'hidden' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // Con un file caricato, larghezza e altezza si leggono dal file (servono al sito per riservare lo spazio).
        static::saving(function (Certification $certification) {
            if ($certification->isDirty('preview_upload') && $certification->preview_upload) {
                $size = Uploads::imageSize($certification->preview_upload);

                if ($size !== null) {
                    [$certification->preview_width, $certification->preview_height] = $size;
                }
            }
        });

        static::saved(fn () => PublicCache::forgetAll());
        static::deleted(fn () => PublicCache::forgetAll());
    }

    /**
     * Indirizzo dell'immagine: il file caricato (URL completo) se c'è, altrimenti quello scritto a mano.
     */
    public function previewUrl(): ?string
    {
        return Uploads::url($this->preview_upload) ?? $this->preview;
    }

    /**
     * @return list<string>
     */
    protected function uploadColumns(): array
    {
        return ['preview_upload'];
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @param  Builder<Certification>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('hidden', false);
    }

    /**
     * @param  Builder<Certification>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderBy('position')->orderBy('id');
    }
}
