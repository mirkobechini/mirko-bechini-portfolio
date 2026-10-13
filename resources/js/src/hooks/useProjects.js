import { getProjects } from "../features/modals/projects/services/projectsApi";
import { mapApiProjects } from "../features/modals/projects/services/projectMapper";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "projects_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare i progetti.";

const loadFallback = async () => (
    await import("../features/modals/projects/services/fallbackProjects")
).default;

/**
 * Progetti dalla API del sito: cache valida → API → cache scaduta → elenco statico.
 *
 * @returns {{ projects: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useProjects() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getProjects,
        mapper: mapApiProjects,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { projects: items, loading, error, refetch };
}
