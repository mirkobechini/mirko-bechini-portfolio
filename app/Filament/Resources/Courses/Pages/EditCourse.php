<?php

namespace App\Filament\Resources\Courses\Pages;

use App\Filament\Concerns\ImportsPdfPreview;
use App\Filament\Resources\Courses\CourseResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCourse extends EditRecord
{
    use ImportsPdfPreview;

    protected static string $resource = CourseResource::class;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeSave(array $data): array
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

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
