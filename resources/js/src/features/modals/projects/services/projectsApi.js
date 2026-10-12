import { fetchList } from "../../../../services/apiClient";

/**
 * Chiamata alla API del sito (Laravel): GET /api/projects.
 * Il browser non parla più direttamente con GitHub: ci pensa il backend (sync + cache).
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} progetti nel formato dell'API (senza preview)
 */
export function getProjects(signal) {
    return fetchList("/api/projects", signal);
}
