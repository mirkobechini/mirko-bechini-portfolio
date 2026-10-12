/**
 * Chiamata alla API del sito (Laravel): GET /api/projects.
 * Il browser non parla più direttamente con GitHub: ci pensa il backend (sync + cache).
 */

const PROJECTS_URL = "/api/projects";

/**
 * Recupera i progetti visibili dal backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} progetti nel formato dell'API (senza preview)
 */
export async function getProjects(signal) {
    const response = await fetch(PROJECTS_URL, {
        headers: { Accept: "application/json" },
        signal,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const body = await response.json();

    if (!body || !Array.isArray(body.data)) {
        throw new Error("API error: risposta non valida");
    }

    return body.data;
}
