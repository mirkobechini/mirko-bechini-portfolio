<?php

namespace App\Enums;

use Carbon\CarbonInterface;
use Filament\Support\Contracts\HasLabel;

/**
 * Ogni quanto si sincronizzano i progetti con GitHub. Si sceglie dal pannello.
 * Lo scheduler controlla ogni ora; il comando parte solo se la sincronizzazione è "scaduta".
 */
enum SyncFrequency: string implements HasLabel
{
    case Manual = 'manual';
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Biweekly = 'biweekly';
    case Monthly = 'monthly';

    public function getLabel(): string
    {
        return match ($this) {
            self::Manual => 'Solo manuale',
            self::Daily => 'Ogni giorno',
            self::Weekly => 'Ogni settimana',
            self::Biweekly => 'Ogni 2 settimane',
            self::Monthly => 'Ogni mese',
        };
    }

    /** Giorni tra due sincronizzazioni automatiche (null = mai in automatico). */
    public function days(): ?int
    {
        return match ($this) {
            self::Manual => null,
            self::Daily => 1,
            self::Weekly => 7,
            self::Biweekly => 14,
            self::Monthly => 30,
        };
    }

    /**
     * Va sincronizzato adesso? Si conta dall'ultima sincronizzazione RIUSCITA: se l'ultima è fallita
     * si riprova al prossimo controllo (ogni ora), senza aspettare un'altra settimana.
     */
    public function isDue(?CarbonInterface $lastSuccess, CarbonInterface $now): bool
    {
        $days = $this->days();

        if ($days === null) {
            return false;
        }

        return $lastSuccess === null || $now->greaterThanOrEqualTo($lastSuccess->copy()->addDays($days));
    }
}
