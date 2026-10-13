import { getSkills, mapApiSkills } from "../features/modals/library/skillsApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "skills_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare le competenze.";

const loadFallback = async () => (
    await import("../features/modals/library/skillsData")
).default;

/**
 * Competenze dalla API del sito: cache valida → API → cache scaduta → skillsData.js.
 *
 * @returns {{ skills: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useSkills() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getSkills,
        mapper: mapApiSkills,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { skills: items, loading, error, refetch };
}
