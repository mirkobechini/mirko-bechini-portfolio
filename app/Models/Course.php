<?php

namespace App\Models;

use App\Models\Concerns\CleansUpUploads;
use App\Support\PublicCache;
use App\Support\Uploads;
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
        'organization',
        'organization_url',
        'period',
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
            'position' => 'integer',
            'hidden' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
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
     * @param  Builder<Course>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderBy('position')->orderBy('id');
    }
}
