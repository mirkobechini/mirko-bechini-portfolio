import { fetchList } from "../../../services/apiClient";

/**
 * GET /api/about: il testo del modale About Me (un elenco di un solo elemento, come le altre risposte).
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export function getAbout(signal) {
    return fetchList("/api/about", signal);
}

/**
 * Testo dell'API → { title, paragraphs } validi. Un elemento malformato viene scartato, così il sito
 * ricade sul testo di riserva invece di mostrare un modale vuoto.
 * @param {Array} items
 * @returns {Array<{title: string, paragraphs: string[]}>}
 */
export function mapApiAbout(items) {
    return items
        .filter((item) => item && typeof item.title === "string" && Array.isArray(item.paragraphs))
        .map((item) => ({
            title: item.title,
            paragraphs: item.paragraphs.filter((paragraph) => typeof paragraph === "string" && paragraph.trim() !== ""),
        }))
        .filter((item) => item.title.trim() !== "" || item.paragraphs.length > 0);
}
