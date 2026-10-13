import { getAssetPath } from "./assets";

/**
 * Indirizzo di un'immagine arrivata dall'API del sito.
 * - percorso in public/assets (es. "/modals/skills/icons/html.webp"): riceve il prefisso degli asset;
 * - file caricato dal pannello (URL completo, oppure "/storage/..." sul disco pubblico): resta com'è;
 * - vuoto: null.
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export function resolveAssetUrl(value) {
    if (typeof value !== "string" || value === "") return null;

    const isLocalAsset = value.startsWith("/") && !value.startsWith("/storage/");

    return isLocalAsset ? getAssetPath(value) : value;
}
