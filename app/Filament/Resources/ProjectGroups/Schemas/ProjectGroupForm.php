<?php

namespace App\Filament\Resources\ProjectGroups\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ProjectGroupForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Nome')
                    ->helperText('Per esempio un cliente o un\'azienda: "Cliente A", "Azienda B".')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Textarea::make('description')
                    ->label('Appunti')
                    ->rows(3)
                    ->columnSpanFull(),
            ]);
    }
}
