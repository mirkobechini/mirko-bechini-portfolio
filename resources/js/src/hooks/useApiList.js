import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

/**
 * Carica un elenco dalla API del sito con questa catena di fallback:
 * cache valida → API → cache scaduta → dati statici.
 *
 * @param {Object} options
 * @param {string} options.cacheKey - chiave localStorage (incrementa la versione se cambia il formato)
 * @param {number} options.ttlMs - validità della cache
 * @param {(signal?: AbortSignal) => Promise<Array>} options.fetcher - legge l'elenco grezzo dalla API
 * @param {(items: Array) => Array} options.mapper - dalla forma dell'API a quella dei componenti
 * @param {() => Promise<Array>} options.loadFallback - dati statici di riserva (import dinamico)
 * @param {string} options.errorMessage - testo mostrato se la API non risponde
 * @returns {{ items: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useApiList({ cacheKey, ttlMs, fetcher, mapper, loadFallback, errorMessage }) {
    const { get, getStale, set } = useLocalStorage(cacheKey, ttlMs);

    // Cache valida, altrimenti dati scaduti (meglio che niente mentre il fetch parte)
    const [items, setItems] = useState(() => get() ?? getStale() ?? []);
    const [loading, setLoading] = useState(() => !get());
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            const data = await fetcher();
            // Una lista vuota non è credibile: meglio i dati di riserva
            if (data.length === 0) throw new Error("API error: elenco vuoto");

            const mapped = mapper(data);
            setItems(mapped);
            set(mapped);
        } catch (err) {
            console.error(`${cacheKey}:`, err);
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
        if (!get()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            load();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { items, loading, error, refetch };
}
