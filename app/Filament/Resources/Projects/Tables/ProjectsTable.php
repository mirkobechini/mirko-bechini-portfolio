<?php

namespace App\Filament\Resources\Projects\Tables;

use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class ProjectsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Titolo')
                    ->description(fn ($record): string => $record->github_repo)
                    ->searchable(['title', 'github_repo'])
                    ->sortable(),
                TextColumn::make('type')
                    ->label('Categoria')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->sortable(),
                TextColumn::make('scope')
                    ->label('Ambito')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'work' ? 'Lavoro' : 'Personale')
                    ->sortable(),
                // Interruttori direttamente nella riga: un clic, senza aprire il progetto.
                ToggleColumn::make('pinned')
                    ->label('In evidenza'),
                ToggleColumn::make('hidden')
                    ->label('Nascosto'),
                TextColumn::make('stars')
                    ->label('★')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('pushed_at')
                    ->label('Aggiornato')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('pushed_at', 'desc')
            ->filters([
                SelectFilter::make('type')
                    ->label('Categoria')
                    ->options(['frontend' => 'Frontend', 'backend' => 'Backend', 'fullstack' => 'Fullstack']),
                SelectFilter::make('scope')
                    ->label('Ambito')
                    ->options(['personal' => 'Personale', 'work' => 'Lavoro']),
                TernaryFilter::make('pinned')
                    ->label('In evidenza'),
                TernaryFilter::make('hidden')
                    ->label('Nascosto'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            // Niente eliminazione: il sync ricreerebbe i progetti cancellati. Per toglierne uno dal sito si usa "Nascosto".
            // Azioni sui progetti selezionati (le caselle a sinistra delle righe).
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('hide')
                        ->label('Nascondi dal sito')
                        ->icon(Heroicon::OutlinedEyeSlash)
                        ->action(fn (Collection $records) => $records->each->update(['hidden' => true]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('show')
                        ->label('Mostra sul sito')
                        ->icon(Heroicon::OutlinedEye)
                        ->action(fn (Collection $records) => $records->each->update(['hidden' => false]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('pin')
                        ->label('Metti in evidenza')
                        ->icon(Heroicon::OutlinedStar)
                        ->action(fn (Collection $records) => $records->each->update(['pinned' => true]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('unpin')
                        ->label('Togli dall\'evidenza')
                        ->icon(Heroicon::OutlinedMinusCircle)
                        ->action(fn (Collection $records) => $records->each->update(['pinned' => false]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }
}
