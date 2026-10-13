<?php

namespace App\Filament\Resources\Certifications\Schemas;

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
                            ->maxLength(255),
                        TextInput::make('organization_url')
                            ->label('Sito dell\'ente')
                            ->url()
                            ->maxLength(255),
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
                            ->columnSpanFull(),
                        TextInput::make('preview')
                            ->label('Indirizzo dell\'immagine')
                            ->helperText('URL oppure percorso in public/assets (/modals/certifications/x.webp). Obbligatorio solo se non carichi un file.')
                            ->required(fn (Get $get): bool => blank($get('preview_upload')))
                            ->maxLength(255)
                            ->columnSpanFull(),
                        TextInput::make('preview_width')
                            ->label('Larghezza (px)')
                            ->numeric()
                            ->minValue(1),
                        TextInput::make('preview_height')
                            ->label('Altezza (px)')
                            ->numeric()
                            ->minValue(1),
                        Select::make('skills')
                            ->label('Skill')
                            ->multiple()
                            ->options(fn (): array => Skill::query()->orderBy('name')->pluck('name', 'name')->all())
                            ->searchable()
                            ->columnSpanFull(),
                        Toggle::make('hidden')
                            ->label('Nascosta')
                            ->helperText('Una certificazione nascosta non compare sul sito.'),
                    ]),
            ]);
    }
}
