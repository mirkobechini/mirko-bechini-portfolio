<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/**
 * Ambito di un progetto: personale o di lavoro. Valori FISSI (il filtro del sito React li elenca
 * in useProjectFilters.js). Per raggruppare i progetti in altri modi (cliente, azienda...) si usano
 * i raggruppamenti (tabella project_groups), non nuovi ambiti.
 */
enum ProjectScope: string implements HasColor, HasLabel
{
    case Personal = 'personal';
    case Work = 'work';

    public function getLabel(): string
    {
        return match ($this) {
            self::Personal => 'Personale',
            self::Work => 'Lavoro',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Personal => 'gray',
            self::Work => 'primary',
        };
    }
}
