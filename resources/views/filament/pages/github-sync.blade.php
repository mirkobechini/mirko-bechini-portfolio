<x-filament-panels::page>
    {{ $this->form }}

    <x-filament::section heading="Stato">
        <dl class="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-[max-content_1fr]">
            <dt class="font-medium text-gray-950 dark:text-white">Ultima sincronizzazione riuscita</dt>
            <dd class="text-gray-600 dark:text-gray-300">
                @if ($lastSuccess)
                    {{ $lastSuccess->locale('it')->timezone('Europe/Rome')->isoFormat('dddd D MMMM YYYY, HH:mm') }}
                    ({{ $lastSuccess->locale('it')->diffForHumans() }})
                @else
                    Mai.
                @endif
            </dd>

            <dt class="font-medium text-gray-950 dark:text-white">Ultimo tentativo</dt>
            <dd class="text-gray-600 dark:text-gray-300">
                @if ($lastRun)
                    <span @class([
                        'font-medium',
                        'text-success-600 dark:text-success-400' => $lastRun['ok'],
                        'text-danger-600 dark:text-danger-400' => ! $lastRun['ok'],
                    ])>{{ $lastRun['ok'] ? 'Riuscito' : 'Non riuscito' }}</span>
                    il {{ $lastRun['at']->locale('it')->timezone('Europe/Rome')->isoFormat('D MMMM YYYY, HH:mm') }}:
                    {{ $lastRun['message'] }}
                @else
                    Nessuno.
                @endif
            </dd>

            <dt class="font-medium text-gray-950 dark:text-white">Prossima sincronizzazione</dt>
            <dd class="text-gray-600 dark:text-gray-300">{{ $nextRun }}</dd>

            <dt class="font-medium text-gray-950 dark:text-white">Utente GitHub</dt>
            <dd class="text-gray-600 dark:text-gray-300">{{ $username }}</dd>

            <dt class="font-medium text-gray-950 dark:text-white">Token GitHub</dt>
            <dd class="text-gray-600 dark:text-gray-300">
                @if ($hasToken)
                    Configurato (limite di 5000 richieste all'ora).
                @else
                    <span class="text-warning-600 dark:text-warning-400">Non configurato</span>:
                    il limite è di 60 richieste all'ora. Aggiungi <code>GITHUB_TOKEN</code> alle variabili d'ambiente.
                @endif
            </dd>
        </dl>
    </x-filament::section>

    <x-filament::section heading="Come funziona">
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
            <li>Aggiorna <strong>solo</strong> stelle, data dell'ultimo aggiornamento, indirizzo del repository e tecnologie di GitHub.</li>
            <li>Un repository <strong>nuovo</strong> viene creato <strong>nascosto</strong>: rivedilo nei Progetti (descrizione, categoria, ambito) e poi togli "Nascosto".</li>
            <li>Un progetto che su GitHub non c'è più <strong>non viene toccato</strong>.</li>
            <li>Fork e repository archiviati non vengono importati.</li>
        </ul>
    </x-filament::section>
</x-filament-panels::page>
