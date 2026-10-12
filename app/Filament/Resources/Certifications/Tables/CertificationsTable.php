<?php

namespace App\Filament\Resources\Certifications\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class CertificationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Titolo')
                    ->searchable()
                    ->wrap(),
                TextColumn::make('organization')
                    ->label('Ente')
                    ->searchable(),
                TextColumn::make('course.course')
                    ->label('Corso')
                    ->placeholder('Nessuno')
                    ->limit(40),
                ToggleColumn::make('hidden')
                    ->label('Nascosta'),
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
