<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/**
 * Stato di un passo del percorso. Valori FISSI: corrispondono alle classi `status-*` di
 * FormationView.module.css e alle etichette di FormationView.jsx (onHold, inProgress, next, done).
 */
enum FormationStepStatus: string implements HasColor, HasLabel
{
    case OnHold = 'onHold';
    case InProgress = 'inProgress';
    case Next = 'next';
    case Done = 'done';

    public function getLabel(): string
    {
        return match ($this) {
            self::OnHold => 'In sospeso',
            self::InProgress => 'In corso',
            self::Next => 'Prossimo',
            self::Done => 'Completato',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::OnHold => 'danger',
            self::InProgress => 'warning',
            self::Next => 'info',
            self::Done => 'success',
        };
    }
}
