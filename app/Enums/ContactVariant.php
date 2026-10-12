<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

/**
 * Colore del bordo della card di un contatto. Valori FISSI: corrispondono alle classi di
 * ContactsModal.module.css (mail, linkedin, github, other); un nuovo colore richiede anche il CSS.
 */
enum ContactVariant: string implements HasLabel
{
    case Mail = 'mail';
    case Linkedin = 'linkedin';
    case Github = 'github';
    case Other = 'other';

    public function getLabel(): string
    {
        return match ($this) {
            self::Mail => 'Arancione (email)',
            self::Linkedin => 'Blu (LinkedIn)',
            self::Github => 'Grigio scuro (GitHub)',
            self::Other => 'Neutro',
        };
    }
}
