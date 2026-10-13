<?php

namespace App\Filament\Resources\FormationSteps\Pages;

use App\Filament\Resources\FormationSteps\FormationStepResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFormationStep extends EditRecord
{
    protected static string $resource = FormationStepResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
