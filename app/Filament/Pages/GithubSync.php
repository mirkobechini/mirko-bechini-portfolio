<?php

namespace App\Filament\Pages;

use App\Enums\SyncFrequency;
use App\GithubSync\GithubClient;
use App\GithubSync\SyncRunner;
use App\GithubSync\SyncSettings;
use BackedEnum;
use Carbon\CarbonImmutable;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

/**
 * Pagina del pannello per la sincronizzazione dei progetti con GitHub: frequenza, stato dell'ultima
 * esecuzione e pulsante "Sincronizza ora". La logica vera sta in App\GithubSync.
 */
class GithubSync extends Page
{
    protected string $view = 'filament.pages.github-sync';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowPath;

    protected static ?string $navigationLabel = 'Sincronizzazione GitHub';

    protected static ?string $title = 'Sincronizzazione GitHub';

    protected static ?int $navigationSort = 3;

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(SyncSettings $settings): void
    {
        $this->form->fill(['frequency' => $settings->frequency()->value]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Frequenza')
                    ->description('Ogni quanto aggiornare da GitHub stelle, date e tecnologie dei progetti. Il resto lo scrivi tu e non viene mai toccato.')
                    ->schema([
                        Select::make('frequency')
                            ->label('Aggiorna automaticamente')
                            ->options(SyncFrequency::class)
                            ->native(false)
                            ->required()
                            ->live()
                            // Con options(<enum>) Filament passa l'enum, ma accettiamo anche la stringa.
                            ->afterStateUpdated(function (SyncFrequency|string|null $state): void {
                                $frequency = $state instanceof SyncFrequency ? $state : SyncFrequency::tryFrom((string) $state);

                                if ($frequency === null) {
                                    return;
                                }

                                app(SyncSettings::class)->setFrequency($frequency);

                                Notification::make()
                                    ->title('Frequenza salvata: '.$frequency->getLabel())
                                    ->success()
                                    ->send();
                            })
                            ->helperText('La modifica vale subito, senza deploy. "Solo manuale" aggiorna soltanto col pulsante "Sincronizza ora".'),
                    ]),
            ])
            ->statePath('data');
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('syncNow')
                ->label('Sincronizza ora')
                ->icon(Heroicon::OutlinedArrowPath)
                ->action(function (): void {
                    $outcome = app(SyncRunner::class)->run();

                    if ($outcome['ok']) {
                        Notification::make()
                            ->title('Sincronizzazione completata')
                            ->body($outcome['message'])
                            ->success()
                            ->send();

                        return;
                    }

                    Notification::make()
                        ->title('Sincronizzazione non riuscita')
                        ->body($outcome['message'])
                        ->danger()
                        ->persistent()
                        ->send();
                }),
        ];
    }

    /**
     * Dati per la vista (stato dell'ultima sincronizzazione, token, prossima esecuzione).
     *
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        $settings = app(SyncSettings::class);
        $frequency = $settings->frequency();
        $lastSuccess = $settings->lastSuccessAt();

        return [
            'lastRun' => $settings->lastRun(),
            'lastSuccess' => $lastSuccess,
            'nextRun' => $this->nextRun($frequency, $lastSuccess),
            'hasToken' => app(GithubClient::class)->hasToken(),
            'username' => (string) config('services.github.username'),
        ];
    }

    private function nextRun(SyncFrequency $frequency, ?CarbonImmutable $lastSuccess): string
    {
        $days = $frequency->days();

        if ($days === null) {
            return 'Mai in automatico (solo col pulsante).';
        }

        if ($lastSuccess === null || $frequency->isDue($lastSuccess, CarbonImmutable::now())) {
            return 'Al prossimo controllo orario.';
        }

        return $lastSuccess->addDays($days)->locale('it')->timezone('Europe/Rome')->isoFormat('dddd D MMMM YYYY, HH:mm').' circa.';
    }
}
