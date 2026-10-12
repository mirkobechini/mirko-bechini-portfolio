<?php

namespace App\Filament\Resources\Skills\Pages;

use App\Filament\Resources\Skills\SkillResource;
use App\Support\PublicSkills;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSkill extends EditRecord
{
    protected static string $resource = SkillResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    // I progetti collegati si salvano dopo la skill, senza passare dagli eventi del modello: aggiorna la cache.
    protected function afterSave(): void
    {
        PublicSkills::forget();
    }
}
