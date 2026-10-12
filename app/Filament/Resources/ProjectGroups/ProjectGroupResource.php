<?php

namespace App\Filament\Resources\ProjectGroups;

use App\Filament\Resources\ProjectGroups\Pages\CreateProjectGroup;
use App\Filament\Resources\ProjectGroups\Pages\EditProjectGroup;
use App\Filament\Resources\ProjectGroups\Pages\ListProjectGroups;
use App\Filament\Resources\ProjectGroups\Schemas\ProjectGroupForm;
use App\Filament\Resources\ProjectGroups\Tables\ProjectGroupsTable;
use App\Models\ProjectGroup;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ProjectGroupResource extends Resource
{
    protected static ?string $model = ProjectGroup::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFolder;

    protected static ?string $navigationLabel = 'Raggruppamenti';

    protected static ?string $modelLabel = 'raggruppamento';

    protected static ?string $pluralModelLabel = 'raggruppamenti';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return ProjectGroupForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProjectGroupsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProjectGroups::route('/'),
            'create' => CreateProjectGroup::route('/create'),
            'edit' => EditProjectGroup::route('/{record}/edit'),
        ];
    }
}
