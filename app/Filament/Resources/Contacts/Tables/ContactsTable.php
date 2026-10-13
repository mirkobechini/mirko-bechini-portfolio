<?php

namespace App\Filament\Resources\Contacts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class ContactsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('icon')
                    ->label(''),
                TextColumn::make('label')
                    ->label('Etichetta')
                    ->searchable(),
                TextColumn::make('href')
                    ->label('Indirizzo')
                    ->limit(50),
                ToggleColumn::make('hidden')
                    ->label('Nascosto'),
            ])
            // Trascina le righe per cambiare l'ordine in cui compaiono sul sito.
            ->reorderable('position')
            ->defaultSort('position')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
