{{--
    Il layout usa stili inline: Filament compila solo le classi Tailwind che usa lui, quindi griglie e
    dimensioni "nostre" non avrebbero effetto senza un tema personalizzato.
--}}
@php
    $dateFormat = 'dddd D MMMM YYYY, HH:mm';
    $grid = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem;';
    $label = 'font-size:0.75rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;opacity:0.65;margin:0 0 0.4rem;';
    $big = 'font-size:1.05rem;font-weight:600;margin:0;line-height:1.35;';
    $small = 'font-size:0.85rem;opacity:0.75;margin:0.35rem 0 0;line-height:1.45;';
@endphp

<x-filament-panels::page>
    {{ $this->form }}

    <div style="{{ $grid }}">
        {{-- Ultima sincronizzazione riuscita --}}
        <x-filament::section>
            <p style="{{ $label }}">Ultima sincronizzazione riuscita</p>
            @if ($lastSuccess)
                <p style="{{ $big }}">{{ $lastSuccess->locale('it')->timezone('Europe/Rome')->isoFormat($dateFormat) }}</p>
                <p style="{{ $small }}">{{ $lastSuccess->locale('it')->diffForHumans() }}</p>
            @else
                <p style="{{ $big }}">Mai.</p>
            @endif
        </x-filament::section>

        {{-- Ultimo tentativo --}}
        <x-filament::section>
            <p style="{{ $label }}">Ultimo tentativo</p>
            @if ($lastRun)
                <p style="margin:0 0 0.5rem;">
                    <x-filament::badge :color="$lastRun['ok'] ? 'success' : 'danger'">
                        {{ $lastRun['ok'] ? 'Riuscito' : 'Non riuscito' }}
                    </x-filament::badge>
                </p>
                <p style="{{ $big }}">{{ $lastRun['message'] }}</p>
                <p style="{{ $small }}">{{ $lastRun['at']->locale('it')->timezone('Europe/Rome')->isoFormat('D MMMM YYYY, HH:mm') }}</p>
            @else
                <p style="{{ $big }}">Nessuno.</p>
            @endif
        </x-filament::section>

        {{-- Prossima sincronizzazione --}}
        <x-filament::section>
            <p style="{{ $label }}">Prossima sincronizzazione</p>
            <p style="{{ $big }}">{{ $nextRun }}</p>
        </x-filament::section>

        {{-- Connessione a GitHub --}}
        <x-filament::section>
            <p style="{{ $label }}">Connessione a GitHub</p>
            <p style="{{ $big }}">{{ $username }}</p>
            <p style="margin:0.6rem 0 0;">
                @if ($hasToken)
                    <x-filament::badge color="success">Token configurato</x-filament::badge>
                @else
                    <x-filament::badge color="warning">Token non configurato</x-filament::badge>
                @endif
            </p>
            <p style="{{ $small }}">
                @if ($hasToken)
                    Configurato (limite di 5000 richieste all'ora).
                @else
                    Non configurato: il limite è di 60 richieste all'ora. Aggiungi <code>GITHUB_TOKEN</code> alle variabili d'ambiente.
                @endif
            </p>
        </x-filament::section>
    </div>

    <x-filament::section heading="Come funziona" icon="heroicon-o-information-circle">
        <div style="{{ $grid }}">
            <div>
                <p style="{{ $label }}">Cosa aggiorna</p>
                <p style="{{ $small }};margin-top:0;">Solo stelle, data dell'ultimo aggiornamento, indirizzo del repository e tecnologie di GitHub. Il resto lo scrivi tu e non viene mai toccato.</p>
            </div>
            <div>
                <p style="{{ $label }}">Repository nuovi</p>
                <p style="{{ $small }};margin-top:0;">Vengono creati <strong>nascosti</strong>: rivedili nei Progetti (descrizione, categoria, ambito) e poi togli "Nascosto".</p>
            </div>
            <div>
                <p style="{{ $label }}">Repository scomparsi</p>
                <p style="{{ $small }};margin-top:0;">Un progetto che su GitHub non c'è più <strong>non viene toccato</strong>.</p>
            </div>
            <div>
                <p style="{{ $label }}">Esclusi</p>
                <p style="{{ $small }};margin-top:0;">Fork e repository archiviati non vengono importati.</p>
            </div>
        </div>
    </x-filament::section>
</x-filament-panels::page>
