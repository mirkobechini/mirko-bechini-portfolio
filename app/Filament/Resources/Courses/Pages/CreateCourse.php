<?php

namespace App\Filament\Resources\Courses\Pages;

use App\Filament\Concerns\ImportsPdfPreview;
use App\Filament\Resources\Courses\CourseResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCourse extends CreateRecord
{
    use ImportsPdfPreview;

    protected static string $resource = CourseResource::class;

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
        return 'certificate_upload';
    }

    protected function pdfImportDirectory(): string
    {
        return 'courses/certificates';
    }
}
