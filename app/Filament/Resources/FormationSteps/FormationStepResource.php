<?php

namespace App\Filament\Resources\FormationSteps;

use App\Filament\Resources\FormationSteps\Pages\CreateFormationStep;
use App\Filament\Resources\FormationSteps\Pages\EditFormationStep;
use App\Filament\Resources\FormationSteps\Pages\ListFormationSteps;
use App\Filament\Resources\FormationSteps\Schemas\FormationStepForm;
use App\Filament\Resources\FormationSteps\Tables\FormationStepsTable;
use App\Models\FormationStep;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FormationStepResource extends Resource
{
    protected static ?string $model = FormationStep::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMap;

    protected static ?string $navigationLabel = 'Percorso e prossimi step';

    protected static ?string $modelLabel = 'passo del percorso';

    protected static ?string $pluralModelLabel = 'passi del percorso';

    protected static ?int $navigationSort = 5;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return FormationStepForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FormationStepsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFormationSteps::route('/'),
            'create' => CreateFormationStep::route('/create'),
            'edit' => EditFormationStep::route('/{record}/edit'),
        ];
    }
}
