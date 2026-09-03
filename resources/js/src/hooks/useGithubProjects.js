import { useState, useEffect, useCallback, useRef } from "react";
import { getRepos } from "../features/modals/projects/services/githubApi";
import { transformRepos } from "../features/modals/projects/services/projectMapper";
import useLocalStorage from "./useLocalStorage";

// Bump della versione quando cambia il formato dei dati (es. aggiunta campo pinned)
const CACHE_KEY = "github_projects_cache_v2";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minuti

/**
 * Hook che carica i progetti dalla GitHub REST API.
 * Con cache in localStorage (TTL 30 min) e fallback su cache scaduta se API è down.
 *
 * @returns {{ projects: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useGithubProjects() {
    const cache = useLocalStorage(CACHE_KEY, CACHE_TTL_MS);

    const [projects, setProjects] = useState(() => {
        // Inizializza con la cache se presente
        const cached = cache.get();
        return cached ?? [];
    });

    const [loading, setLoading] = useState(() => {
        return !cache.get(); // loading solo se non c'è cache
    });

    const [error, setError] = useState(null);

    // Ref per evitare setState sincrono dentro l'effect al primo mount
    const isFirstFetch = useRef(true);

    const fetchProjects = useCallback(async () => {
        // Al primo fetch (dal mount) loading/error sono già sui valori di default:
        // evita setState sincroni dentro l'effect (render a cascata)
        if (!isFirstFetch.current) {
            setLoading(true);
            setError(null);
        }

        try {
            const repos = await getRepos();
            const mapped = transformRepos(repos);
            setProjects(mapped);
            cache.set(mapped);
        } catch (err) {
            console.error("GitHub API error:", err);
            setError("Impossibile caricare i progetti da GitHub.");

            // Fallback: usa cache scaduta se disponibile
            const expiredCache = cache.get();
            if (expiredCache && expiredCache.length > 0) {
                setProjects(expiredCache);
            } else {
                // Fallback finale: usa l'import statico (ultima spiaggia)
                try {
                    const { default: fallbackData } = await import(
                        "../features/modals/projects/services/fallbackProjects"
                    );
                    setProjects(fallbackData);
                } catch {
                    // Nessun fallback disponibile
                    setProjects([]);
                }
            }
        } finally {
            if (!isFirstFetch.current) {
                setLoading(false);
            }
            isFirstFetch.current = false;
        }
    }, [cache]);

    useEffect(() => {
        const cached = cache.get();
        if (!cached) {
            // Il fetch è asincrono: i setState avvengono dopo il primo await, non sincroni nell'effect
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchProjects();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { projects, loading, error, refetch: fetchProjects };
}