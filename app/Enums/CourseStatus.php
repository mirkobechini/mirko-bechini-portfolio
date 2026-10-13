<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/**
 * A che punto sei con un corso. Valori FISSI e uguali a quelli di FormationStepStatus (stesse classi CSS e
 * stesse etichette del sito). I corsi "in corso" e "in sospeso" compaiono da soli nel Focus attuale.
 */
enum CourseStatus: string implements HasColor, HasLabel
{
    case InProgress = 'inProgress';
    case OnHold = 'onHold';
    case Completed = 'done';

    public function getLabel(): string
    {
        return match ($this) {
            self::InProgress => 'In corso',
            self::OnHold => 'In sospeso',
            self::Completed => 'Completato',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::InProgress => 'warning',
            self::OnHold => 'danger',
            self::Completed => 'success',
        };
    }

    /**
     * Il corso rientra nel Focus attuale?
     */
    public function isOngoing(): bool
    {
        return $this !== self::Completed;
    }
}
