import { getCourses, mapApiCourses, sortCoursesByRecency } from "../features/modals/library/coursesApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "courses_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare la formazione.";

const loadFallback = async () => sortCoursesByRecency(
    (await import("../features/modals/library/educationData")).default
);

/**
 * Corsi dalla API del sito: cache valida → API → cache scaduta → educationData.js.
 *
 * @returns {{ courses: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useCourses() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getCourses,
        mapper: mapApiCourses,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { courses: items, loading, error, refetch };
}
