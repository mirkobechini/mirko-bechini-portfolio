<?php

namespace App\Models;

use App\Support\PublicCache;
use App\Support\SkillNameReferences;
use Database\Factories\SkillFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Una competenza mostrata nella libreria del sito. I progetti collegati sono quelli della tabella
 * projects (relazione) più eventuale testo libero in extra_projects (es. "Tutti i progetti").
 */
class Skill extends Model
{
    /** @use HasFactory<SkillFactory> */
    use HasFactory;

    protected $fillable = ['name', 'icon', 'category', 'color', 'functions', 'extra_projects', 'position', 'hidden'];

    protected function casts(): array
    {
        return [
            'functions' => 'array',
            'extra_projects' => 'array',
            'position' => 'integer',
            'hidden' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // I corsi citano le skill per nome: un rinomino o un'eliminazione li aggiorna.
        static::updated(function (Skill $skill) {
            if ($skill->wasChanged('name')) {
                SkillNameReferences::rename($skill->getOriginal('name'), $skill->name);
            }
        });
        static::deleted(fn (Skill $skill) => SkillNameReferences::remove($skill->name));
        static::saved(fn () => PublicCache::forgetAll());
        static::deleted(fn () => PublicCache::forgetAll());
    }

    /**
     * @return BelongsToMany<Project, $this>
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class);
    }

    /**
     * @param  Builder<Skill>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('hidden', false);
    }

    /**
     * @param  Builder<Skill>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderBy('position')->orderBy('name');
    }
}
