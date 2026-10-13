<?php

namespace App\Filament\Resources\Skills\Pages;

use App\Filament\Resources\Skills\SkillResource;
use App\Support\PublicCache;
use Filament\Resources\Pages\CreateRecord;

class CreateSkill extends CreateRecord
{
    protected static string $resource = SkillResource::class;

    // I progetti collegati si salvano dopo la skill, senza passare dagli eventi del modello: aggiorna la cache.
    protected function afterCreate(): void
    {
        PublicCache::forgetAll();
    }
}
