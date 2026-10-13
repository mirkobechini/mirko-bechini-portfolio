<?php

namespace App\Models;

use App\Models\Concerns\CleansUpUploads;
use App\Support\PublicCache;
use App\Support\SkillNameReferences;
use App\Support\Uploads;
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
    use CleansUpUploads;

    use HasFactory;

    protected $fillable = ['name', 'icon', 'icon_upload', 'category', 'color', 'functions', 'extra_projects', 'position', 'hidden'];

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
     * Indirizzo dell'icona: il file caricato (URL completo) se c'è, altrimenti il percorso predefinito
     * dentro public/assets (che il sito completa con il suo prefisso).
     */
    public function iconUrl(): ?string
    {
        return Uploads::url($this->icon_upload) ?? $this->icon;
    }

    /**
     * @return list<string>
     */
    protected function uploadColumns(): array
    {
        return ['icon_upload'];
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
