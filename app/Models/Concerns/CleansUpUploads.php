<?php

namespace App\Models\Concerns;

use App\Support\Uploads;

/**
 * Toglie dal disco i file caricati che non servono più: quello sostituito da uno nuovo, e quelli di un
 * record eliminato. Il modello elenca le sue colonne con `uploadColumns()`.
 */
trait CleansUpUploads
{
    /**
     * @return list<string>
     */
    abstract protected function uploadColumns(): array;

    protected static function bootCleansUpUploads(): void
    {
        static::updated(function ($model): void {
            foreach ($model->uploadColumns() as $column) {
                if ($model->wasChanged($column)) {
                    Uploads::delete($model->getOriginal($column));
                }
            }
        });

        static::deleted(function ($model): void {
            foreach ($model->uploadColumns() as $column) {
                Uploads::delete($model->{$column});
            }
        });
    }
}
