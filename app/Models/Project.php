<?php

namespace App\Models;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Support\PublicCache;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'github_repo',
        'title',
        'description_it',
        'type',
        'scope',
        'technologies',
        'extra_technologies',
        'repo_url',
        'live_url',
        'stars',
        'pushed_at',
        'pinned',
        'hidden',
        'synced_at',
        'project_group_id',
        'course_id',
    ];

    protected static function booted(): void
    {
        // Ogni modifica (anche quella del sync o dei pulsanti del pannello) svuota la cache dell'API pubblica.
        // I progetti compaiono anche in skill e corsi: si svuota tutta la cache pubblica.
        static::saved(fn () => PublicCache::forgetAll());
        static::deleted(fn () => PublicCache::forgetAll());
    }

    /**
     * Solo i progetti che il sito può mostrare (non nascosti).
     *
     * @param  Builder<Project>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('hidden', false);
    }

    /**
     * Ordine di visualizzazione sul sito: prima quelli in evidenza, poi i più recenti (senza data in fondo).
     *
     * @param  Builder<Project>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderByDesc('pinned')
            ->orderByRaw('pushed_at IS NULL')
            ->orderByDesc('pushed_at')
            ->orderBy('title');
    }

    /**
     * Le competenze usate in questo progetto.
     *
     * @return BelongsToMany<Skill, $this>
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class);
    }

    /**
     * Il corso per cui è stato fatto il progetto (facoltativo).
     *
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Il raggruppamento scelto nel pannello (cliente, azienda...), se c'è.
     *
     * @return BelongsTo<ProjectGroup, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(ProjectGroup::class, 'project_group_id');
    }

    protected function casts(): array
    {
        return [
            'type' => ProjectType::class,
            'scope' => ProjectScope::class,
            'technologies' => 'array',
            'extra_technologies' => 'array',
            'pinned' => 'boolean',
            'hidden' => 'boolean',
            'pushed_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }
}
