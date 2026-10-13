import { fetchList } from "../../../services/apiClient";
import { resolveAssetUrl } from "../../../utils/assetUrl";

/**
 * GET /api/education: corsi visibili, già ordinati dal backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export function getCourses(signal) {
    return fetchList("/api/education", signal);
}

/**
 * Corso dell'API → formato atteso dal libro "Formazione" (come educationData.js).
 * L'attestato può essere un URL esterno oppure un percorso locale (/modals/...): solo il secondo
 * riceve il prefisso degli asset.
 * @param {Object} course
 * @returns {Object}
 */
export function mapApiCourse(course) {
    return {
        ...course,
        certificate: resolveAssetUrl(course.certificate) ?? "",
        skills: Array.isArray(course.skills) ? course.skills : [],
        highlights: Array.isArray(course.highlights) ? course.highlights : [],
        modules: Array.isArray(course.modules)
            ? course.modules.map((module) => ({
                ...module,
                skillsModules: Array.isArray(module.skillsModules) ? module.skillsModules : [],
            }))
            : [],
    };
}

export const mapApiCourses = (courses) => courses.map(mapApiCourse);
