<?php

namespace App\Models;

use App\Enums\ContactVariant;
use App\Support\PublicCache;
use Database\Factories\ContactFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Un modo per contattarmi, mostrato nella finestra del pappagallo.
 */
class Contact extends Model
{
    /** @use HasFactory<ContactFactory> */
    use HasFactory;

    /** Indirizzi accettati: niente javascript:, data: e simili. */
    public const HREF_PATTERN = '/^(https?:\/\/|mailto:|tel:)\S+$/i';

    protected $fillable = ['label', 'href', 'icon', 'aria_label', 'variant', 'position', 'hidden'];

    protected function casts(): array
    {
        return [
            'variant' => ContactVariant::class,
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
     * @param  Builder<Contact>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('hidden', false);
    }

    /**
     * @param  Builder<Contact>  $query
     */
    public function scopeInDisplayOrder(Builder $query): void
    {
        $query->orderBy('position')->orderBy('id');
    }
}
