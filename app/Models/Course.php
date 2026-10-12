<?php

namespace App\Models;

use App\Support\PublicCache;
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
    use HasFactory;

    protected $fillable = [
        'course',
        'description',
        'certificate',
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
     * @return HasMany<Project, $this>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
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
