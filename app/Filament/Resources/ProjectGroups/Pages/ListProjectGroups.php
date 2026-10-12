<?php

namespace App\Filament\Resources\ProjectGroups\Pages;

use App\Filament\Resources\ProjectGroups\ProjectGroupResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProjectGroups extends ListRecords
{
    protected static string $resource = ProjectGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
