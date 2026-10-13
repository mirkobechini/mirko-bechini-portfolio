<?php

namespace App\Filament\Resources\Courses\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class CoursesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('course')
                    ->label('Corso')
                    ->searchable()
                    ->wrap(),
                TextColumn::make('organization')
                    ->label('Ente')
                    ->searchable(),
                TextColumn::make('period')
                    ->label('Periodo')
                    ->sortable(['started_at']),
                TextColumn::make('projects_count')
                    ->label('Progetti')
                    ->counts('projects'),
                ToggleColumn::make('hidden')
                    ->label('Nascosto'),
            ])
            // Stesso ordine del sito: dal più recente al più vecchio, secondo l'inizio del periodo.
            ->modifyQueryUsing(fn ($query) => $query->inDisplayOrder())
            ->defaultSort(null)
            ->recordActions([
                EditAction::make(),
                // Eliminare un corso NON cancella i progetti: restano, senza corso.
                DeleteAction::make()
                    ->modalDescription('I progetti collegati non vengono eliminati: restano, senza corso.'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->modalDescription('I progetti collegati non vengono eliminati: restano, senza corso.'),
                ]),
            ]);
    }
}
