import { useState, useCallback } from "react";

/**
 * Hook generico per localStorage con TTL (time-to-live).
 * Se la cache è scaduta o assente, get() restituisce null.
 * Già pronto per essere riutilizzato da un futuro hook Laravel.
 *
 * @param {string} key - Chiave localStorage
 * @param {number} ttlMs - Durata validità in millisecondi (default: 30 minuti)
 * @returns {Object} { get: () => data|null, set: (data) => void, remove: () => void }
 */
export default function useLocalStorage(key, ttlMs = 30 * 60 * 1000) {
    const [cachedData, setCachedData] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            const now = Date.now();

            if (parsed.expiry && now > parsed.expiry) {
                localStorage.removeItem(key);
                return null;
            }

            return parsed.data;
        } catch {
            localStorage.removeItem(key);
            return null;
        }
    });

    const get = useCallback(() => {
        return cachedData;
    }, [cachedData]);

    const set = useCallback(
        (data) => {
            const payload = JSON.stringify({
                data,
                expiry: Date.now() + ttlMs,
            });
            localStorage.setItem(key, payload);
            setCachedData(data);
        },
        [key, ttlMs]
    );

    const remove = useCallback(() => {
        localStorage.removeItem(key);
        setCachedData(null);
    }, [key]);

    return { get, set, remove };
}