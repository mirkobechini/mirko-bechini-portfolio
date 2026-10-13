<?php

namespace App\Filament\Resources\FormationSteps\Tables;

use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class FormationStepsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('kind')
                    ->label('Colonna')
                    ->badge(),
                TextColumn::make('title')
                    ->label('Titolo')
                    ->searchable()
                    ->wrap(),
                // Lo stato si cambia con un menu nella riga: tipico quando un passo "Prossimo" diventa "In corso".
                SelectColumn::make('status')
                    ->label('Stato')
                    ->options(FormationStepStatus::class)
                    ->selectablePlaceholder(false),
                TextColumn::make('badge')
                    ->label('Etichetta')
                    ->placeholder('—'),
                ToggleColumn::make('hidden')
                    ->label('Nascosto'),
            ])
            // Trascina le righe per cambiare l'ordine: vale dentro ciascuna colonna del sito.
            ->reorderable('position')
            ->defaultSort('position')
            ->defaultGroup('kind')
            ->filters([
                SelectFilter::make('kind')
                    ->label('Colonna')
                    ->options(FormationStepKind::class),
                SelectFilter::make('status')
                    ->label('Stato')
                    ->options(FormationStepStatus::class),
            ])
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
