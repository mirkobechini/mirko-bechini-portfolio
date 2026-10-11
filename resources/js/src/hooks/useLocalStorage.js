import { useState, useCallback } from "react";

/**
 * Hook generico per localStorage con TTL (time-to-live).
 * Se la cache è scaduta o assente, get() restituisce null.
 * Già pronto per essere riutilizzato da un futuro hook Laravel.
 *
 * @param {string} key - Chiave localStorage
 * @param {number} ttlMs - Durata validità in millisecondi (default: 30 minuti)
 * @returns {Object} { get: () => data|null, getStale: () => data|null, set: (data) => void, remove: () => void }
 */
export default function useLocalStorage(key, ttlMs = 30 * 60 * 1000) {
    const [cachedData, setCachedData] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return { data: null, expired: false };

            const parsed = JSON.parse(raw);
            const now = Date.now();

            if (parsed.expiry && now > parsed.expiry) {
                return { data: parsed.data, expired: true };
            }

            return { data: parsed.data, expired: false };
        } catch {
            try {
                localStorage.removeItem(key);
            } catch {
                console.error("Errore durante la rimozione della chiave localStorage:", key);
            }
            return { data: null, expired: false };
        }
    });

    const get = useCallback(() => {
        return cachedData.expired ? null : cachedData.data;
    }, [cachedData]);

    const set = useCallback(
        (data) => {
            const payload = JSON.stringify({
                data,
                expiry: Date.now() + ttlMs,
            });
            try{
                localStorage.setItem(key, payload);

            } catch (error) {
                console.error("Errore durante il salvataggio in localStorage:", error);
            }
            setCachedData({ data, expired: false });
        },
        [key, ttlMs]
    );

    const remove = useCallback(() => {
        try{
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Errore durante la rimozione dalla localStorage:", error);
        }
        setCachedData({ data: null, expired: false });
    }, [key]);

    const getStale = useCallback(() => {
        return cachedData.data;
    }, [cachedData]);

    return { get, getStale, set, remove };
}