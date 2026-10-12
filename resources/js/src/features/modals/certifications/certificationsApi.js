import { fetchList } from "../../../services/apiClient";
import { getAssetPath } from "../../../utils/assets";

/**
 * GET /api/certifications: attestati visibili, già ordinati dal backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export function getCertifications(signal) {
    return fetchList("/api/certifications", signal);
}

/**
 * Attestato dell'API → formato atteso dalla galleria (come certificationData.js).
 * L'immagine può essere un URL esterno oppure un percorso locale (/modals/...): solo il secondo
 * riceve il prefisso degli asset.
 * @param {Object} certification
 * @returns {Object}
 */
export function mapApiCertification(certification) {
    const preview = certification.preview ?? "";

    return {
        ...certification,
        preview: preview.startsWith("/") ? getAssetPath(preview) : preview,
        skills: Array.isArray(certification.skills) ? certification.skills : [],
    };
}

export const mapApiCertifications = (certifications) => certifications.map(mapApiCertification);
