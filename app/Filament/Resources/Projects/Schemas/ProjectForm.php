<?php

namespace App\Filament\Resources\Projects\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Contenuti del sito')
                    ->description('Quello che scrivi tu. La sincronizzazione con GitHub non lo modifica mai.')
                    ->schema([
                        TextInput::make('title')
                            ->label('Titolo')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('live_url')
                            ->label('Sito online')
                            ->url()
                            ->maxLength(255),
                        Textarea::make('description_it')
                            ->label('Descrizione (italiano)')
                            ->rows(4)
                            ->columnSpanFull(),
                        Select::make('type')
                            ->label('Tipo')
                            ->options([
                                'frontend' => 'Frontend',
                                'backend' => 'Backend',
                                'fullstack' => 'Fullstack',
                            ])
                            ->default('fullstack')
                            ->required(),
                        Select::make('scope')
                            ->label('Ambito')
                            ->options([
                                'personal' => 'Personale',
                                'work' => 'Lavoro',
                            ])
                            ->default('personal')
                            ->required(),
                        TagsInput::make('extra_technologies')
                            ->label('Tecnologie aggiuntive')
                            ->helperText('Solo quelle che GitHub non conosce (AI, Figma...). Quelle di GitHub si aggiungono da sole.')
                            ->columnSpanFull(),
                        Toggle::make('pinned')
                            ->label('In evidenza (in cima all\'elenco)'),
                        Toggle::make('hidden')
                            ->label('Nascosto dal sito'),
                    ])
                    ->columns(2),

                Section::make('Da GitHub')
                    ->description('Si aggiorna da solo con la sincronizzazione: qui è in sola lettura.')
                    ->schema([
                        // Il nome del repo si sceglie solo quando si crea il progetto: dopo è la chiave del sync.
                        TextInput::make('github_repo')
                            ->label('Repository')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->disabled(fn (string $operation): bool => $operation === 'edit')
                            ->dehydrated(fn (string $operation): bool => $operation === 'create'),
                        TextInput::make('repo_url')
                            ->label('Indirizzo del repository')
                            ->url()
                            ->required()
                            ->maxLength(255)
                            ->disabled(fn (string $operation): bool => $operation === 'edit')
                            ->dehydrated(fn (string $operation): bool => $operation === 'create'),
                        TagsInput::make('technologies')
                            ->label('Tecnologie (da GitHub)')
                            ->disabled()
                            ->dehydrated(false)
                            ->columnSpanFull(),
                        TextInput::make('stars')
                            ->label('Stelle')
                            ->numeric()
                            ->disabled()
                            ->dehydrated(false),
                        DateTimePicker::make('pushed_at')
                            ->label('Ultimo aggiornamento del repository')
                            ->disabled()
                            ->dehydrated(false),
                        DateTimePicker::make('synced_at')
                            ->label('Ultima sincronizzazione')
                            ->disabled()
                            ->dehydrated(false),
                    ])
                    ->columns(2),
            ]);
    }
}
