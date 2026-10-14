/**
 * Lettura di un elenco dalla API del sito (Laravel). Le risposte hanno la forma { data: [...] }.
 * @param {string} url - per esempio "/api/skills"
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} il contenuto di `data`
 */
export async function fetchList(url, signal) {
    const response = await fetch(url, {
        headers: { Accept: "application/json" },
        // Il browser deve sempre chiedere al server se la risposta è cambiata (If-None-Match → 304 se no),
        // invece di riusare una copia della sua cache HTTP senza controllare.
        cache: "no-cache",
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
