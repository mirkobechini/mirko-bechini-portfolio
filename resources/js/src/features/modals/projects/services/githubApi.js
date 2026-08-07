/**
 * Chiamate alla GitHub REST API.
 * Restituisce dati grezzi dei repos.
 */

const GITHUB_API_BASE = "https://api.github.com";
const USERNAME = "mirkobechini";

/**
 * Recupera tutti i repos pubblici dell'utente.
 * Esclude automaticamente i fork.
 * @returns {Promise<Array>} array di repo GitHub grezzi
 */
export async function getRepos() {
    const url = `${GITHUB_API_BASE}/users/${USERNAME}/repos?per_page=100&sort=pushed&direction=desc&type=public`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github.v3+json",
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos = await response.json();

    // Escludi fork e repo archiviati
    return repos.filter((repo) => !repo.fork && !repo.archived);
}