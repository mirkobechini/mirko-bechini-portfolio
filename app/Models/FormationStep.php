<?php

namespace App\Models;

use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use App\Support\PublicCache;
use Database\Factories\FormationStepFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Un passo della pagina "Percorso e prossimi step" del libro Formazione: cosa sto studiando ora
 * (focus) o cosa voglio fare dopo (roadmap).
 */
class FormationStep extends Model
{
    /** @use HasFactory<FormationStepFactory> */
    use HasFactory;

    protected $fillable = ['kind', 'title', 'description', 'status', 'badge', 'position', 'hidden'];

    protected function casts(): array
    {
        return [
            'kind' => FormationStepKind::class,
            'status' => FormationStepStatus::class,
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
     * @param  Builder<FormationStep>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('hidden', false);
    }

    /**
     * Ordine dentro ciascuna colonna (focus e roadmap si separano nel sito).
     *
     * @param  Builder<FormationStep>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderBy('position')->orderBy('id');
    }
}
