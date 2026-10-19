<?php

namespace App\Filament\Resources\Courses\Schemas;

use App\Enums\CourseStatus;
use App\Models\Skill;
use App\Support\Uploads;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class CourseForm
{
    /**
     * Nomi delle skill esistenti: i corsi le citano per nome, così il sito può aprirne la scheda.
     *
     * @return array<string, string>
     */
    private static function skillOptions(): array
    {
        return Skill::query()->orderBy('name')->pluck('name', 'name')->all();
    }

    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Corso')
                    ->columns(2)
                    ->schema([
                        TextInput::make('course')
                            ->label('Titolo')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        TextInput::make('organization')
                            ->label('Ente')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('organization_url')
                            ->label('Sito dell\'ente')
                            ->url()
                            ->maxLength(255),
                        TextInput::make('period')
                            ->label('Periodo')
                            ->helperText('Testo libero, per esempio "05/2025 - 02/2026" oppure "03/2026 - current". Il primo mese indicato decide l\'ordine sul sito: dal corso più recente al più vecchio.')
                            ->required()
                            ->maxLength(255),
                        Select::make('status')
                            ->label('Stato')
                            ->options(CourseStatus::class)
                            ->default(CourseStatus::InProgress)
                            ->required()
                            ->helperText('I corsi "In corso" e "In sospeso" compaiono da soli in "Focus attuale"; quando lo segni "Completato" esce da solo.'),
                        FileUpload::make('certificate_upload')
                            ->label('Attestato (carica un file)')
                            ->helperText('PNG, WebP o JPG, al massimo 2 MB. Ha la precedenza sull\'indirizzo qui sotto. Quando il corso è "Completato", l\'attestato compare anche nella galleria Certificazioni (se non hai già una certificazione collegata a questo corso).')
                            ->image()
                            ->acceptedFileTypes(Uploads::IMAGE_TYPES)
                            ->maxSize(2048)
                            ->disk(Uploads::diskName())
                            ->directory('courses/certificates')
                            ->visibility('public'),
                        FileUpload::make('pdf_import')
                            ->label('Oppure carica un PDF')
                            ->helperText('Si usa la prima pagina come immagine dell\'attestato (ci vuole qualche secondo). Il PDF non viene conservato né pubblicato: sul sito resta solo l\'immagine. Se carichi anche un\'immagine qui sopra, vale quella del PDF.')
                            ->acceptedFileTypes(['application/pdf'])
                            ->maxSize(10240)
                            ->storeFiles(false),
                        TextInput::make('certificate')
                            ->label('Indirizzo dell\'attestato')
                            ->helperText('URL dell\'immagine oppure percorso in public/assets (/modals/certifications/x.webp). Usato se non carichi un file.')
                            ->maxLength(255),
                        Textarea::make('description')
                            ->label('Descrizione')
                            ->required()
                            ->rows(3)
                            ->columnSpanFull(),
                        Select::make('skills')
                            ->label('Skill del corso')
                            ->multiple()
                            ->options(fn (): array => self::skillOptions())
                            ->searchable()
                            ->columnSpanFull(),
                        Toggle::make('hidden')
                            ->label('Nascosto')
                            ->helperText('Un corso nascosto non compare sul sito.'),
                    ]),
                Section::make('Dettagli')
                    ->schema([
                        Repeater::make('highlights')
                            ->label('Punti salienti')
                            ->simple(TextInput::make('value')->required()->maxLength(255))
                            ->defaultItems(0)
                            ->addActionLabel('Aggiungi punto')
                            ->reorderable(),
                        Repeater::make('modules')
                            ->label('Moduli')
                            ->schema([
                                TextInput::make('title')->label('Titolo')->required()->maxLength(255),
                                Textarea::make('description')->label('Descrizione')->rows(2),
                                Select::make('skills')
                                    ->label('Skill del modulo')
                                    ->multiple()
                                    ->options(fn (): array => self::skillOptions())
                                    ->searchable(),
                            ])
                            ->itemLabel(fn (array $state): ?string => $state['title'] ?? null)
                            ->collapsed()
                            ->defaultItems(0)
                            ->addActionLabel('Aggiungi modulo')
                            ->reorderable(),
                    ]),
            ]);
    }
}
