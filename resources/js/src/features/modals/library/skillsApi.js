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

// Un'icona caricata dal pannello arriva come URL completo; quella predefinita come percorso in public/assets
function resolveIcon(icon) {
    if (!icon) return null;
    // /storage/... è il disco pubblico dei caricamenti: non sta in public/assets
    return icon.startsWith("/") && !icon.startsWith("/storage/") ? getAssetPath(icon) : icon;
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
        icon: resolveIcon(skill.icon),
        functions: Array.isArray(skill.functions) ? skill.functions : [],
        relatedProjects: Array.isArray(skill.relatedProjects) ? skill.relatedProjects : [],
    };
}

export const mapApiSkills = (skills) => skills.map(mapApiSkill);
