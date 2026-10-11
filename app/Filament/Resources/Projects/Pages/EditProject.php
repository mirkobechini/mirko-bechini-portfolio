<?php

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use Filament\Resources\Pages\EditRecord;

class EditProject extends EditRecord
{
    protected static string $resource = ProjectResource::class;

    // Nessun pulsante "Elimina": per togliere un progetto dal sito si usa l'interruttore "Nascosto".
    protected function getHeaderActions(): array
    {
        return [];
    }
}
