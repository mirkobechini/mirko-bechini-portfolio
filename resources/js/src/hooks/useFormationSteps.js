import { useMemo } from "react";
import {
    getFormationSteps,
    mapApiFormationSteps,
    splitFormationSteps,
} from "../features/modals/library/formationStepsApi";
import useApiList from "./useApiList";

// Bump della versione quando cambia il formato dei dati
const CACHE_KEY = "formation_steps_api_cache_v1";
const ERROR_MESSAGE = "Impossibile caricare il percorso di formazione.";

const loadFallback = async () => (
    await import("../features/modals/library/formationStepsData")
).default;

/**
 * Passi di "Percorso e prossimi step" dalla API del sito: cache valida → API → cache scaduta →
 * formationStepsData.js. Restituisce già le due colonne.
 *
 * @returns {{ focus: Array, roadmap: Array, loading: boolean, error: string|null, refetch: () => void }}
 */
export default function useFormationSteps() {
    const { items, loading, error, refetch } = useApiList({
        cacheKey: CACHE_KEY,
        fetcher: getFormationSteps,
        mapper: mapApiFormationSteps,
        loadFallback,
        errorMessage: ERROR_MESSAGE,
    });

    const { focus, roadmap } = useMemo(() => splitFormationSteps(items), [items]);

    return { focus, roadmap, loading, error, refetch };
}
