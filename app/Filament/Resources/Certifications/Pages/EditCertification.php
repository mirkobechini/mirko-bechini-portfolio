<?php

namespace App\Filament\Resources\Certifications\Pages;

use App\Filament\Resources\Certifications\CertificationResource;
use App\Filament\Resources\Certifications\Pages\Concerns\ImportsPdfPreview;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCertification extends EditRecord
{
    use ImportsPdfPreview;

    protected static string $resource = CertificationResource::class;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        return $this->convertPdfImport($data);
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
