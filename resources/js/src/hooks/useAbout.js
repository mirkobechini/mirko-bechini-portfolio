import { getAbout, mapApiAbout } from "../features/modals/about/aboutApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "about_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare il testo.";

const loadFallback = async () => (
    await import("../features/modals/about/aboutData")
).default;

/**
 * Testo di About Me dalla API del sito: cache valida → API → cache scaduta → aboutData.js.
 * `about` è null finché non c'è nulla da mostrare (solo al primo caricamento senza cache).
 *
 * @returns {{ about: {title: string, paragraphs: string[]}|null, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useAbout() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getAbout,
        mapper: mapApiAbout,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { about: items[0] ?? null, loading, error, refetch };
}
