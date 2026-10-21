<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

/**
 * Il testo del modale "About Me": titolo e paragrafi, salvati come impostazione ("about") e modificabili
 * dalla pagina del pannello. Finché non si salva nulla vale il testo di partenza (DEFAULTS), così il sito
 * non resta mai senza. Vedi PublicCache per l'invalidazione.
 */
class PublicAbout
{
    public const CACHE_KEY = 'api.about.v1';

    public const SETTING_KEY = 'about';

    public const TTL_SECONDS = 600;

    /** Lo stesso testo di aboutData.js, la riserva del sito. */
    public const DEFAULTS = [
        'title' => 'Ciao sono Mirko',
        'paragraphs' => [
            'Un sviluppatore web che ha arricchito le proprie competenze in Informatica, acquisite alle scuole superiori, conseguendo un Masterclass in Web Development.',
            'Le esperienze passate mi hanno permesso di acquisire importanti soft skills, come la capacità di lavorare in team, la gestione del tempo e la risoluzione di problemi in contesti critici.',
            'Oltre alla programmazione sono appassionato al mondo dei videogiochi, da cui ho preso ispirazione per la realizzazione di questo portfolio.',
            'Mi piace leggere i manga, guardare gli anime e allenarmi in palestra, tutte attività che mi aiutano ad affrontare le sfide quotidiane con grinta e perseveranza.',
        ],
    ];

    /**
     * Il testo attuale: quello salvato dal pannello, altrimenti quello di partenza.
     *
     * @return array{title: string, paragraphs: list<string>}
     */
    public static function content(): array
    {
        $saved = Setting::get(self::SETTING_KEY);

        $title = is_array($saved) && is_string($saved['title'] ?? null) ? trim($saved['title']) : '';
        $paragraphs = is_array($saved) && is_array($saved['paragraphs'] ?? null)
            ? array_values(array_filter(array_map(fn (mixed $p): string => is_string($p) ? trim($p) : '', $saved['paragraphs'])))
            : [];

        if ($title === '' && $paragraphs === []) {
            return self::DEFAULTS;
        }

        return ['title' => $title, 'paragraphs' => $paragraphs];
    }

    /**
     * @param  list<string>  $paragraphs
     */
    public static function save(string $title, array $paragraphs): void
    {
        Setting::put(self::SETTING_KEY, ['title' => trim($title), 'paragraphs' => array_values($paragraphs)]);

        PublicCache::forgetAll();
    }

    /**
     * Come per le altre risposte `data` è un elenco, qui di un solo elemento: il sito usa lo stesso
     * meccanismo di lettura e cache di tutte le altre finestre.
     *
     * @return array{data: list<array{title: string, paragraphs: list<string>}>}
     */
    public static function payload(): array
    {
        return Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, fn (): array => ['data' => [self::content()]]);
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
