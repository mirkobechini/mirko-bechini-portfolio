import { useState, useEffect, useCallback } from "react";
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
    const { get, getStale, set } = useLocalStorage(CACHE_KEY, CACHE_TTL_MS);

    // Cache valida, altrimenti dati scaduti (meglio che niente mentre il fetch parte)
    const [projects, setProjects] = useState(() => get() ?? getStale() ?? []);
    const [loading, setLoading] = useState(() => !get());
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            const repos = await getRepos();
            const mapped = transformRepos(repos);
            setProjects(mapped);
            set(mapped);
        } catch (err) {
            console.error("GitHub API error:", err);
            setError("Impossibile caricare i progetti da GitHub.");

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