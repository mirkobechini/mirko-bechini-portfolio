<?php

namespace App\Filament\Resources\Contacts\Schemas;

use App\Enums\ContactVariant;
use App\Models\Contact;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ContactForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('label')
                    ->label('Etichetta')
                    ->helperText('Il testo sulla card, per esempio "Email".')
                    ->required()
                    ->maxLength(255),
                TextInput::make('icon')
                    ->label('Icona (emoji)')
                    ->required()
                    ->maxLength(16),
                TextInput::make('href')
                    ->label('Indirizzo')
                    ->helperText('mailto:nome@esempio.it, tel:+39..., oppure un indirizzo che inizia con https://')
                    ->required()
                    ->maxLength(255)
                    ->regex(Contact::HREF_PATTERN)
                    ->validationMessages(['regex' => 'Deve iniziare con https://, http://, mailto: o tel:.'])
                    ->columnSpanFull(),
                TextInput::make('aria_label')
                    ->label('Descrizione per screen reader')
                    ->helperText('Per esempio "Apri profilo LinkedIn".')
                    ->required()
                    ->maxLength(255)
                    ->columnSpanFull(),
                Select::make('variant')
                    ->label('Colore del bordo')
                    ->options(ContactVariant::class)
                    ->default(ContactVariant::Other)
                    ->required(),
                Toggle::make('hidden')
                    ->label('Nascosto')
                    ->helperText('Un contatto nascosto non compare sul sito.'),
            ]);
    }
}
