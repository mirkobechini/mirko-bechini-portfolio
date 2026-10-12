import { useState, useEffect, useCallback } from "react";
import { getProjects } from "../features/modals/projects/services/projectsApi";
import { mapApiProjects } from "../features/modals/projects/services/projectMapper";
import useLocalStorage from "./useLocalStorage";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "projects_api_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minuti, come la cache del server

/**
 * Carica i progetti dalla API del sito. Catena di fallback:
 * cache valida → API → cache scaduta → dati statici (fallbackProjects).
 *
 * @returns {{ projects: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useProjects() {
    const { get, getStale, set } = useLocalStorage(CACHE_KEY, CACHE_TTL_MS);

    // Cache valida, altrimenti dati scaduti (meglio che niente mentre il fetch parte)
    const [projects, setProjects] = useState(() => get() ?? getStale() ?? []);
    const [loading, setLoading] = useState(() => !get());
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            const data = await getProjects();
            // Una lista vuota non è credibile per un portfolio: meglio i dati di riserva
            if (data.length === 0) throw new Error("API error: nessun progetto");

            const mapped = mapApiProjects(data);
            setProjects(mapped);
            set(mapped);
        } catch (err) {
            console.error("Projects API error:", err);
            setError("Impossibile caricare i progetti.");

            const stale = getStale();
            if (stale && stale.length > 0) {
                setProjects(stale);
            } else {
                try {
                    const { default: fallbackData } = await import(
                        "../features/modals/projects/services/fallbackProjects"
                    );
                    setProjects(fallbackData);
                } catch {
                    setProjects([]);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [getStale, set]);

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

    return { projects, loading, error, refetch };
}
