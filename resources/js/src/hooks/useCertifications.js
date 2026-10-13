import { getCertifications, mapApiCertifications } from "../features/modals/certifications/certificationsApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "certifications_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare le certificazioni.";

const loadFallback = async () => (
    await import("../features/modals/certifications/certificationData")
).default;

/**
 * Certificazioni dalla API del sito: cache valida → API → cache scaduta → certificationData.js.
 *
 * @returns {{ certifications: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useCertifications() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getCertifications,
        mapper: mapApiCertifications,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { certifications: items, loading, error, refetch };
}
