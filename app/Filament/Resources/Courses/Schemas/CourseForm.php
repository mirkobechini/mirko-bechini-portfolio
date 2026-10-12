<?php

namespace App\Filament\Resources\Courses\Schemas;

use App\Models\Skill;
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
                            ->helperText('Testo libero, per esempio "05/2025 - 02/2026" oppure "03/2026 - current".')
                            ->required()
                            ->maxLength(255),
                        TextInput::make('certificate')
                            ->label('Attestato')
                            ->helperText('URL dell\'immagine oppure percorso in public/assets (/modals/certifications/x.webp). Il caricamento dal pannello arriverà più avanti.')
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
                            ->addActionLabel('Aggiungi modulo')
                            ->reorderable(),
                    ]),
            ]);
    }
}
