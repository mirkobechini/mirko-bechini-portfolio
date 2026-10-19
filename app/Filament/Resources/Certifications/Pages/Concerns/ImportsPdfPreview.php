<?php

namespace App\Filament\Resources\Certifications\Pages\Concerns;

use App\Support\PdfPreview\PdfConversionFailed;
use App\Support\PdfPreview\PdfPreviewImage;
use Filament\Notifications\Notification;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Se nel form è stato caricato un PDF, lo trasforma nell'immagine della certificazione (la prima pagina)
 * prima di salvare. Il PDF non viene conservato: si legge, si converte e il file temporaneo si cancella.
 *
 * Se la conversione non riesce non si salva nulla (si resta sul form con i dati inseriti) e una notifica
 * spiega cosa fare.
 */
trait ImportsPdfPreview
{
    /**
     * @param  array<string, mixed>  $data  dati del form
     * @return array<string, mixed> gli stessi dati, senza il PDF e con `preview_upload` se c'era un PDF
     */
    protected function convertPdfImport(array $data): array
    {
        $upload = $data['pdf_import'] ?? null;
        unset($data['pdf_import']);

        $file = is_array($upload) ? reset($upload) : $upload;

        if (! $file instanceof TemporaryUploadedFile) {
            return $data;
        }

        try {
            $data['preview_upload'] = app(PdfPreviewImage::class)->store($file->get(), 'certifications/previews');
        } catch (PdfConversionFailed $e) {
            Notification::make()
                ->danger()
                ->title('Non sono riuscito a creare l\'immagine dal PDF')
                ->body($e->getMessage().' Non è stato salvato nulla: riprova, oppure carica direttamente un\'immagine.')
                ->persistent()
                ->send();

            $this->halt();
        } finally {
            $file->delete();
        }

        return $data;
    }
}
