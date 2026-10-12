<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/**
 * Categoria di un progetto. Valori FISSI: il sito React ha un'icona e un testo per ciascuno
 * (resources/js/.../useProjectFilters.js), quindi una categoria nuova richiede di toccare anche il sito.
 * Nel database resta una semplice stringa; l'enum la valida e la traduce in etichetta e colore.
 */
enum ProjectType: string implements HasColor, HasLabel
{
    case Frontend = 'frontend';
    case Backend = 'backend';
    case Fullstack = 'fullstack';

    public function getLabel(): string
    {
        return match ($this) {
            self::Frontend => 'Frontend',
            self::Backend => 'Backend',
            self::Fullstack => 'Fullstack',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Frontend => 'info',
            self::Backend => 'warning',
            self::Fullstack => 'success',
        };
    }
}
