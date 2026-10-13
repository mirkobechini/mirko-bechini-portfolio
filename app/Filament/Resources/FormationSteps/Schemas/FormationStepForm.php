<?php

namespace App\Filament\Resources\FormationSteps\Schemas;

use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class FormationStepForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('kind')
                    ->label('Colonna')
                    ->options(FormationStepKind::class)
                    ->default(FormationStepKind::Roadmap)
                    ->required()
                    ->helperText('"Focus attuale" è ciò che stai studiando ora; "Roadmap" ciò che vuoi fare dopo.'),
                Select::make('status')
                    ->label('Stato')
                    ->options(FormationStepStatus::class)
                    ->default(FormationStepStatus::Next)
                    ->required(),
                TextInput::make('title')
                    ->label('Titolo')
                    ->required()
                    ->maxLength(255)
                    ->columnSpanFull(),
                Textarea::make('description')
                    ->label('Descrizione')
                    ->required()
                    ->rows(4)
                    ->columnSpanFull(),
                TextInput::make('badge')
                    ->label('Etichetta')
                    ->helperText('Facoltativa, breve: per esempio "New Skill" o "Portfolio".')
                    ->maxLength(255),
                Toggle::make('hidden')
                    ->label('Nascosto')
                    ->helperText('Un passo nascosto non compare sul sito.'),
            ]);
    }
}
