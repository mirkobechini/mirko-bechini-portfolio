<?php

namespace App\Filament\Resources\Skills\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ColorColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class SkillsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nome')
                    ->searchable(),
                TextColumn::make('category')
                    ->label('Categoria')
                    ->badge()
                    ->searchable(),
                ColorColumn::make('color')
                    ->label('Colore'),
                TextColumn::make('projects_count')
                    ->label('Progetti')
                    ->counts('projects'),
                ToggleColumn::make('hidden')
                    ->label('Nascosta'),
            ])
            // Trascina le righe per cambiare l'ordine in cui compaiono sul sito.
            ->reorderable('position')
            ->defaultSort('position')
            ->filters([])
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
