<?php

namespace App\Filament\Resources\ProjectGroups\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProjectGroupsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nome')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('projects_count')
                    ->label('Progetti')
                    ->counts('projects')
                    ->sortable(),
                TextColumn::make('description')
                    ->label('Appunti')
                    ->limit(60)
                    ->toggleable(),
            ])
            ->defaultSort('name')
            ->recordActions([
                EditAction::make(),
                // Eliminare un raggruppamento NON cancella i progetti: restano, senza raggruppamento.
                DeleteAction::make()
                    ->modalDescription('I progetti di questo raggruppamento non vengono eliminati: restano, senza raggruppamento.'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->modalDescription('I progetti dei raggruppamenti eliminati non vengono cancellati: restano, senza raggruppamento.'),
                ]),
            ]);
    }
}
