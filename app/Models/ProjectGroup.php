<?php

namespace App\Models;

use App\Support\PublicCache;
use Database\Factories\ProjectGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Raggruppamento di progetti definito da te nel pannello (es. "Cliente A", "Azienda B").
 * Un progetto appartiene al massimo a un raggruppamento.
 */
class ProjectGroup extends Model
{
    /** @use HasFactory<ProjectGroupFactory> */
    use HasFactory;

    protected $fillable = ['name', 'description'];

    protected static function booted(): void
    {
        // Il nome del raggruppamento compare nell'API dei progetti.
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
}
