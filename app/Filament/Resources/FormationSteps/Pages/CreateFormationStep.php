<?php

namespace App\Filament\Resources\FormationSteps\Pages;

use App\Filament\Resources\FormationSteps\FormationStepResource;
use App\Models\FormationStep;
use Filament\Resources\Pages\CreateRecord;

class CreateFormationStep extends CreateRecord
{
    protected static string $resource = FormationStepResource::class;

    /**
     * Un passo nuovo va in fondo alla sua colonna.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['position'] = (int) FormationStep::where('kind', $data['kind'])->max('position') + 1;

        return $data;
    }
}
