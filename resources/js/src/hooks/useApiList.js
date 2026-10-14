import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

// Per quanto tempo i dati nella memoria del browser contano come "freschi" (nessuna attesa, nessun avviso).
// Anche con dati freschi il sito li ricontrolla comunque in background a ogni apertura: la API risponde 304
// se nulla è cambiato, quindi una modifica dal pannello compare entro il minuto della cache di rete.
export const API_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minuti

/**
 * Carica un elenco dalla API del sito. Mostra subito i dati già in memoria (anche scaduti) e a ogni
 * apertura li ricontrolla in background; se la API non risponde la catena è:
 * dati in memoria → dati statici di riserva.
 *
 * Con dati freschi in memoria un errore di rete è silenzioso (si tengono i dati che si vedono); senza dati
 * freschi si segnala l'errore e si usano i dati scaduti o quelli di riserva.
 *
 * @param {Object} options
 * @param {string} options.cacheKey - chiave localStorage (incrementa la versione se cambia il formato)
 * @param {number} [options.ttlMs] - validità della cache (predefinito: API_CACHE_TTL_MS)
 * @param {(signal?: AbortSignal) => Promise<Array>} options.fetcher - legge l'elenco grezzo dalla API
 * @param {(items: Array) => Array} options.mapper - dalla forma dell'API a quella dei componenti
 * @param {() => Promise<Array>} options.loadFallback - dati statici di riserva (import dinamico)
 * @param {string} options.errorMessage - testo mostrato se la API non risponde
 * @returns {{ items: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useApiList({ cacheKey, ttlMs = API_CACHE_TTL_MS, fetcher, mapper, loadFallback, errorMessage }) {
    const { get, getStale, set } = useLocalStorage(cacheKey, ttlMs);

    // Cache valida, altrimenti dati scaduti (meglio che niente mentre il fetch parte)
    const [items, setItems] = useState(() => get() ?? getStale() ?? []);
    const [loading, setLoading] = useState(() => !get());
    const [error, setError] = useState(null);

    // silent: i dati mostrati sono freschi e questo è solo un ricontrollo, un fallimento non va segnalato
    const load = useCallback(async ({ silent = false } = {}) => {
        try {
            const data = await fetcher();
            // Una lista vuota non è credibile: meglio i dati di riserva
            if (data.length === 0) throw new Error("API error: elenco vuoto");

            const mapped = mapper(data);
            setItems(mapped);
            set(mapped);
        } catch (err) {
            console.error(`${cacheKey}:`, err);
            if (silent) return;

            setError(errorMessage);

            const stale = getStale();
            if (stale && stale.length > 0) {
                setItems(stale);
            } else {
                try {
                    setItems(await loadFallback());
                } catch {
                    setItems([]);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [fetcher, mapper, loadFallback, errorMessage, cacheKey, getStale, set]);

    const refetch = useCallback(() => {
        setLoading(true);
        setError(null);
        return load();
    }, [load]);

    useEffect(() => {
        // A ogni apertura si ricontrolla la API, anche se in memoria ci sono dati freschi
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load({ silent: get() !== null });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { items, loading, error, refetch };
}
