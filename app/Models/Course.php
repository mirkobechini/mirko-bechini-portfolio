<?php

namespace App\Models;

use App\Enums\CourseStatus;
use App\Models\Concerns\CleansUpUploads;
use App\Support\PublicCache;
use App\Support\Uploads;
use Carbon\CarbonImmutable;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Un percorso di formazione mostrato nel libro "Formazione". I progetti fatti per il corso sono quelli
 * che hanno course_id uguale al suo id.
 */
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use CleansUpUploads;

    use HasFactory;

    protected $fillable = [
        'course',
        'description',
        'certificate',
        'certificate_upload',
        'certificate_width',
        'certificate_height',
        'organization',
        'organization_url',
        'period',
        'status',
        'started_at',
        'skills',
        'highlights',
        'modules',
        'position',
        'hidden',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'highlights' => 'array',
            'modules' => 'array',
            'status' => CourseStatus::class,
            'started_at' => 'date',
            'certificate_width' => 'integer',
            'certificate_height' => 'integer',
            'position' => 'integer',
            'hidden' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // L'inizio si legge sempre dal testo del periodo: per ordinare i corsi basta scrivere bene il periodo.
        static::saving(function (Course $course) {
            $course->started_at = self::startOfPeriod($course->period);
        });

        // Con un attestato caricato, larghezza e altezza si leggono dal file (la galleria riserva lo spazio).
        static::saving(function (Course $course) {
            if ($course->isDirty('certificate_upload')) {
                $size = Uploads::imageSize($course->certificate_upload);

                [$course->certificate_width, $course->certificate_height] = $size ?? [null, null];
            }
        });

        static::saved(fn () => PublicCache::forgetAll());
        static::deleted(fn () => PublicCache::forgetAll());
    }

    /**
     * Indirizzo dell'attestato: il file caricato (URL completo) se c'è, altrimenti quello scritto a mano.
     */
    public function certificateUrl(): ?string
    {
        return Uploads::url($this->certificate_upload) ?? $this->certificate;
    }

    /**
     * @return list<string>
     */
    protected function uploadColumns(): array
    {
        return ['certificate_upload'];
    }

    /**
     * @return HasMany<Project, $this>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * @return HasMany<Certification, $this>
     */
    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    /**
     * @param  Builder<Course>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('hidden', false);
    }

    /**
     * Primo mese indicato nel periodo ("05/2025 - 02/2026" → maggio 2025; solo l'anno → gennaio).
     * Null se nel testo non c'è un anno leggibile.
     */
    public static function startOfPeriod(?string $period): ?CarbonImmutable
    {
        if ($period === null || preg_match('/(?:(\d{1,2})\/)?(\d{4})/', $period, $matches) !== 1) {
            return null;
        }

        $month = $matches[1] === '' ? 1 : (int) $matches[1];

        return $month >= 1 && $month <= 12 ? CarbonImmutable::create((int) $matches[2], $month, 1)->startOfDay() : null;
    }

    /**
     * Ordine di visualizzazione: dal corso iniziato più di recente al più vecchio (senza data in fondo).
     * A parità di inizio, quello inserito dopo viene prima.
     *
     * @param  Builder<Course>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderByRaw('started_at IS NULL')->orderByDesc('started_at')->orderByDesc('id');
    }
}
