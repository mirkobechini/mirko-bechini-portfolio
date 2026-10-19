<?php

namespace App\Filament\Concerns;

use App\Support\PdfPreview\PdfConversionFailed;
use App\Support\PdfPreview\PdfPreviewImage;
use Filament\Notifications\Notification;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Per le pagine di creazione e modifica con un campo "Oppure carica un PDF" (`pdf_import`): prima di salvare
 * trasforma il PDF nell'immagine del record (la prima pagina). Il PDF non viene conservato: si legge, si
 * converte e il file temporaneo si cancella.
 *
 * Se la conversione non riesce non si salva nulla (si resta sul form con i dati inseriti) e una notifica
 * spiega cosa fare.
 *
 * La pagina dice dove mettere l'immagine: la colonna del modello (es. `preview_upload`) e la cartella sul
 * disco degli upload (es. `certifications/previews`).
 */
trait ImportsPdfPreview
{
    /** Colonna del modello che riceve il percorso dell'immagine generata. */
    abstract protected function pdfImportColumn(): string;

    /** Cartella, sul disco degli upload, dove salvare l'immagine generata. */
    abstract protected function pdfImportDirectory(): string;

    /**
     * @param  array<string, mixed>  $data  dati del form
     * @return array<string, mixed> gli stessi dati, senza il PDF e con l'immagine al suo posto se c'era un PDF
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
            $data[$this->pdfImportColumn()] = app(PdfPreviewImage::class)->store($file->get(), $this->pdfImportDirectory());
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
