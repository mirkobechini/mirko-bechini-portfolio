<?php

namespace App\Filament\Resources\ProjectGroups\Pages;

use App\Filament\Resources\ProjectGroups\ProjectGroupResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProjectGroup extends EditRecord
{
    protected static string $resource = ProjectGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
