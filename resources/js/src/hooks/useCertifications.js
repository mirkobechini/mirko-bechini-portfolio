import { getCertifications, mapApiCertifications } from "../features/modals/certifications/certificationsApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "certifications_api_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minuti, come la cache del server
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
        ttlMs: CACHE_TTL_MS,
        fetcher: getCertifications,
        mapper: mapApiCertifications,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { certifications: items, loading, error, refetch };
}
