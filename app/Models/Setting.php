<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Impostazioni chiave -> valore (JSON), modificabili dal pannello.
 */
class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $row = static::where('key', $key)->first();

        if ($row === null || $row->value === null) {
            return $default;
        }

        return json_decode($row->value, true, 512, JSON_THROW_ON_ERROR);
    }

    public static function put(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => json_encode($value, JSON_THROW_ON_ERROR)]);
    }
}
