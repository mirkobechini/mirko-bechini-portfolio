<?php

namespace App\Filament\Resources\Certifications\Pages;

use App\Filament\Resources\Certifications\CertificationResource;
use App\Filament\Resources\Certifications\Pages\Concerns\ImportsPdfPreview;
use Filament\Resources\Pages\CreateRecord;

class CreateCertification extends CreateRecord
{
    use ImportsPdfPreview;

    protected static string $resource = CertificationResource::class;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return $this->convertPdfImport($data);
    }
}
