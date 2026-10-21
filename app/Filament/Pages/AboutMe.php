<?php

namespace App\Filament\Pages;

use App\Support\PublicAbout;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

/**
 * Pagina del pannello per il testo del modale "About Me": titolo e paragrafi. Il disegno (scimmia,
 * pulsante del curriculum) resta nel sito. La lettura e la cache stanno in App\Support\PublicAbout.
 */
class AboutMe extends Page
{
    protected string $view = 'filament.pages.about-me';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUser;

    protected static ?string $navigationLabel = 'About Me';

    protected static ?string $title = 'About Me';

    protected static ?int $navigationSort = 6;

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(PublicAbout::content());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Testo del modale')
                    ->description('Quello che si legge aprendo "About Me" sul sito. Ogni paragrafo è un blocco di testo; si possono aggiungere, togliere e trascinare per cambiare l\'ordine.')
                    ->schema([
                        TextInput::make('title')
                            ->label('Titolo')
                            ->required()
                            ->maxLength(100),
                        Repeater::make('paragraphs')
                            ->label('Paragrafi')
                            ->simple(
                                Textarea::make('text')
                                    ->required()
                                    ->maxLength(1500)
                                    ->rows(3),
                            )
                            ->minItems(1)
                            ->maxItems(10)
                            ->addActionLabel('Aggiungi un paragrafo')
                            ->reorderable()
                            ->defaultItems(0),
                    ]),
            ])
            ->statePath('data');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')
                ->label('Salva')
                ->icon(Heroicon::OutlinedCheck)
                ->action(fn () => $this->save()),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();

        PublicAbout::save($state['title'], array_values($state['paragraphs']));

        Notification::make()
            ->title('Testo salvato')
            ->body('Sul sito compare entro un paio di minuti.')
            ->success()
            ->send();
    }
}
