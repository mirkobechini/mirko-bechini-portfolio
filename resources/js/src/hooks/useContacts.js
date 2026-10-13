import { getContacts, mapApiContacts } from "../features/modals/contacts/contactsApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "contacts_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare i contatti.";

const loadFallback = async () => (
    await import("../features/modals/contacts/contactsData")
).default;

/**
 * Contatti dalla API del sito: cache valida → API → cache scaduta → contactsData.js.
 *
 * @returns {{ contacts: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useContacts() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getContacts,
        mapper: mapApiContacts,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    return { contacts: items, loading, error, refetch };
}
