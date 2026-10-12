<?php

namespace App\Filament\Resources\Skills\Schemas;

use App\Models\Skill;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SkillForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Competenza')
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->label('Nome')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('category')
                            ->label('Categoria')
                            ->required()
                            ->maxLength(255)
                            ->datalist(fn (): array => Skill::query()->distinct()->orderBy('category')->pluck('category')->all()),
                        TextInput::make('icon')
                            ->label('Icona')
                            ->helperText('Percorso del file in public/assets, per esempio /modals/skills/icons/html.webp. Il caricamento dal pannello arriverà più avanti.')
                            ->maxLength(255),
                        ColorPicker::make('color')
                            ->label('Colore')
                            ->required(),
                        Toggle::make('hidden')
                            ->label('Nascosta')
                            ->helperText('Una competenza nascosta non compare sul sito.'),
                    ]),
                Section::make('Dettagli')
                    ->schema([
                        Repeater::make('functions')
                            ->label('Cosa so fare')
                            ->simple(TextInput::make('value')->required()->maxLength(255))
                            ->addActionLabel('Aggiungi voce')
                            ->reorderable(),
                        Select::make('projects')
                            ->label('Progetti collegati')
                            ->relationship('projects', 'title')
                            ->multiple()
                            ->preload()
                            ->searchable(),
                        TagsInput::make('extra_projects')
                            ->label('Altri progetti (testo libero)')
                            ->helperText('Per ciò che non è nell\'elenco progetti, per esempio "Tutti i progetti".'),
                    ]),
            ]);
    }
}
