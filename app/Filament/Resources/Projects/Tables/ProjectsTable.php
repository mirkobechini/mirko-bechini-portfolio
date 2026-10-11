<?php

namespace App\Filament\Resources\Projects\Tables;

use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

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
                    ->label('Tipo')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->sortable(),
                TextColumn::make('scope')
                    ->label('Ambito')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'work' ? 'Lavoro' : 'Personale')
                    ->sortable(),
                IconColumn::make('pinned')
                    ->label('In evidenza')
                    ->boolean(),
                IconColumn::make('hidden')
                    ->label('Nascosto')
                    ->boolean(),
                TextColumn::make('stars')
                    ->label('Stelle')
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
                    ->label('Tipo')
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
            ->toolbarActions([]);
    }
}
