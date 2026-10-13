<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/**
 * In quale colonna della pagina "Percorso e prossimi step" compare un passo. Valori FISSI: il libro
 * "Formazione" ha esattamente queste due colonne.
 */
enum FormationStepKind: string implements HasColor, HasLabel
{
    case Focus = 'focus';
    case Roadmap = 'roadmap';

    public function getLabel(): string
    {
        return match ($this) {
            self::Focus => 'Focus attuale',
            self::Roadmap => 'Roadmap',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Focus => 'warning',
            self::Roadmap => 'info',
        };
    }
}
