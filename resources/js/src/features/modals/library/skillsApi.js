import { fetchList } from "../../../services/apiClient";
import { getAssetPath } from "../../../utils/assets";

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
 * l'API manda il percorso dell'icona, qui diventa l'URL con il prefisso degli asset.
 * @param {Object} skill
 * @returns {Object}
 */
export function mapApiSkill(skill) {
    return {
        ...skill,
        icon: skill.icon ? getAssetPath(skill.icon) : null,
        functions: Array.isArray(skill.functions) ? skill.functions : [],
        relatedProjects: Array.isArray(skill.relatedProjects) ? skill.relatedProjects : [],
    };
}

export const mapApiSkills = (skills) => skills.map(mapApiSkill);
