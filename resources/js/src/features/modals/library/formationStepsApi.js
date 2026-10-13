import { fetchList } from "../../../services/apiClient";

/**
 * GET /api/formation-steps: passi del percorso visibili, già ordinati dal backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export function getFormationSteps(signal) {
    return fetchList("/api/formation-steps", signal);
}

/**
 * Passo dell'API → formato atteso da FormationView: l'etichetta mancante diventa stringa vuota.
 * @param {Object} step
 * @returns {Object}
 */
export function mapApiFormationStep(step) {
    return { ...step, badge: step.badge ?? "" };
}

export const mapApiFormationSteps = (steps) => steps.map(mapApiFormationStep);

/**
 * Divide l'elenco nelle due colonne della pagina, mantenendo l'ordine.
 * @param {Array} steps
 * @returns {{ focus: Array, roadmap: Array }}
 */
export function splitFormationSteps(steps) {
    return {
        focus: steps.filter((step) => step.kind === "focus"),
        roadmap: steps.filter((step) => step.kind === "roadmap"),
    };
}
