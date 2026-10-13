<?php

namespace App\Filament\Resources\Projects\Tables;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Models\ProjectGroup;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
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
                    ->sortable(),
                TextColumn::make('scope')
                    ->label('Ambito')
                    ->badge()
                    ->sortable(),
                TextColumn::make('group.name')
                    ->label('Raggruppamento')
                    ->placeholder('—')
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
                    ->options(ProjectType::class),
                SelectFilter::make('scope')
                    ->label('Ambito')
                    ->options(ProjectScope::class),
                SelectFilter::make('project_group_id')
                    ->label('Raggruppamento')
                    ->relationship('group', 'name'),
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
                    BulkAction::make('assignGroup')
                        ->label('Assegna a un raggruppamento')
                        ->icon(Heroicon::OutlinedFolder)
                        ->schema([
                            Select::make('project_group_id')
                                ->label('Raggruppamento')
                                ->options(fn (): array => ProjectGroup::orderBy('name')->pluck('name', 'id')->all())
                                ->required(),
                        ])
                        ->action(fn (Collection $records, array $data) => $records->each->update(['project_group_id' => $data['project_group_id']]))
                        ->deselectRecordsAfterCompletion(),
                    BulkAction::make('clearGroup')
                        ->label('Togli dal raggruppamento')
                        ->icon(Heroicon::OutlinedXMark)
                        ->action(fn (Collection $records) => $records->each->update(['project_group_id' => null]))
                        ->deselectRecordsAfterCompletion(),
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
