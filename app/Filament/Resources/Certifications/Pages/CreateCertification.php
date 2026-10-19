<?php

namespace App\Filament\Resources\Certifications\Pages;

use App\Filament\Concerns\ImportsPdfPreview;
use App\Filament\Resources\Certifications\CertificationResource;
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

    protected function pdfImportColumn(): string
    {
        return 'preview_upload';
    }

    protected function pdfImportDirectory(): string
    {
        return 'certifications/previews';
    }
}
