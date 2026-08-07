import { useState, useEffect, useCallback } from "react";
import { getRepos } from "../features/modals/projects/services/githubApi";
import { transformRepos } from "../features/modals/projects/services/projectMapper";
import useLocalStorage from "./useLocalStorage";

const CACHE_KEY = "github_projects_cache";
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

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);

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
            setLoading(false);
        }
    }, [cache]);

    useEffect(() => {
        const cached = cache.get();
        if (!cached) {
            fetchProjects();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { projects, loading, error, refetch: fetchProjects };
}