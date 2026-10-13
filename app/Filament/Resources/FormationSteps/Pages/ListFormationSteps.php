<?php

namespace App\Filament\Resources\FormationSteps\Pages;

use App\Filament\Resources\FormationSteps\FormationStepResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFormationSteps extends ListRecords
{
    protected static string $resource = FormationStepResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
