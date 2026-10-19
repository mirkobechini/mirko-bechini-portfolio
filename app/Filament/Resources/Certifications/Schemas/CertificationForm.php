<?php

namespace App\Filament\Resources\Certifications\Schemas;

use App\Models\Certification;
use App\Models\Skill;
use App\Support\Uploads;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class CertificationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Certificazione')
                    ->description(fn (?Certification $record): ?string => $record?->from_course
                        ? 'Questa voce viene dal corso "'.$record->course?->course.'": l\'immagine, l\'ente e le skill si modificano nel corso e si aggiornano da sole. Qui puoi cambiare il titolo e nasconderla.'
                        : null)
                    ->columns(2)
                    ->schema([
                        TextInput::make('title')
                            ->label('Titolo')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        TextInput::make('organization')
                            ->label('Ente')
                            ->required()
                            ->maxLength(255)
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course),
                        TextInput::make('organization_url')
                            ->label('Sito dell\'ente')
                            ->url()
                            ->maxLength(255)
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course),
                        Select::make('course_id')
                            ->label('Corso')
                            ->relationship('course', 'course')
                            ->searchable()
                            ->preload()
                            ->placeholder('Nessuno')
                            ->helperText('Cliccando l\'attestato il sito apre questo corso nel libro "Formazione".')
                            ->columnSpanFull(),
                        TextInput::make('link')
                            ->label('Link di verifica')
                            ->url()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        FileUpload::make('preview_upload')
                            ->label('Immagine (carica un file)')
                            ->helperText('PNG, WebP o JPG, al massimo 2 MB. Larghezza e altezza si leggono dal file. Ha la precedenza sull\'indirizzo qui sotto.')
                            ->image()
                            ->acceptedFileTypes(Uploads::IMAGE_TYPES)
                            ->maxSize(2048)
                            ->disk(Uploads::diskName())
                            ->directory('certifications/previews')
                            ->visibility('public')
                            ->live()
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course)
                            ->columnSpanFull(),
                        FileUpload::make('pdf_import')
                            ->label('Oppure carica un PDF')
                            ->helperText('Si usa la prima pagina come immagine (ci vuole qualche secondo). Il PDF non viene conservato né pubblicato: sul sito resta solo l\'immagine, e nessuno può scaricare l\'originale. Se carichi anche un\'immagine qui sopra, vale quella del PDF.')
                            ->acceptedFileTypes(['application/pdf'])
                            ->maxSize(10240)
                            ->storeFiles(false)
                            ->live()
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course)
                            ->columnSpanFull(),
                        TextInput::make('preview')
                            ->label('Indirizzo dell\'immagine')
                            ->helperText('URL oppure percorso in public/assets (/modals/certifications/x.webp). Obbligatorio solo se non carichi un\'immagine o un PDF.')
                            ->required(fn (Get $get, ?Certification $record): bool => ! $record?->from_course && blank($get('preview_upload')) && blank($get('pdf_import')))
                            ->maxLength(255)
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course)
                            ->columnSpanFull(),
                        TextInput::make('preview_width')
                            ->label('Larghezza (px)')
                            ->numeric()
                            ->minValue(1)
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course),
                        TextInput::make('preview_height')
                            ->label('Altezza (px)')
                            ->numeric()
                            ->minValue(1)
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course),
                        Select::make('skills')
                            ->label('Skill')
                            ->multiple()
                            ->options(fn (): array => Skill::query()->orderBy('name')->pluck('name', 'name')->all())
                            ->searchable()
                            ->disabled(fn (?Certification $record): bool => (bool) $record?->from_course)
                            ->columnSpanFull(),
                        Toggle::make('hidden')
                            ->label('Nascosta')
                            ->helperText('Una certificazione nascosta non compare sul sito.'),
                    ]),
            ]);
    }
}
