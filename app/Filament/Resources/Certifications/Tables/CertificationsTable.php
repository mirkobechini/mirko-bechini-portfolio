<?php

namespace App\Filament\Resources\Certifications\Tables;

use App\Models\Certification;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

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
                TextColumn::make('from_course')
                    ->label('Origine')
                    ->badge()
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Dal corso' : 'A mano')
                    ->color(fn (bool $state): string => $state ? 'info' : 'gray'),
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
                // Una voce "dal corso" non si elimina: tornerebbe al prossimo salvataggio del corso. Si nasconde.
                DeleteAction::make()
                    ->hidden(fn (Certification $record): bool => $record->from_course),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->modalDescription('Le voci "Dal corso" non si eliminano (tornerebbero al prossimo salvataggio del corso): nascondile.')
                        ->using(fn (Collection $records) => $records->reject(fn (Certification $certification): bool => $certification->from_course)->each->delete()),
                ]),
            ]);
    }
}
