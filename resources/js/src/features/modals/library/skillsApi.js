import { fetchList } from "../../../services/apiClient";
import { resolveAssetUrl } from "../../../utils/assetUrl";

/**
 * GET /api/skills: competenze visibili, già ordinate dal backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export function getSkills(signal) {
    return fetchList("/api/skills", signal);
}

/**
 * Skill dell'API → formato atteso dalla libreria (come skillsData.js):
 * l'icona predefinita è un percorso e riceve il prefisso degli asset, quella caricata è già un URL.
 * @param {Object} skill
 * @returns {Object}
 */
export function mapApiSkill(skill) {
    return {
        ...skill,
        icon: resolveAssetUrl(skill.icon),
        functions: Array.isArray(skill.functions) ? skill.functions : [],
        relatedProjects: Array.isArray(skill.relatedProjects) ? skill.relatedProjects : [],
    };
}

export const mapApiSkills = (skills) => skills.map(mapApiSkill);
