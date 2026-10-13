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

/**
 * Primo mese indicato nel periodo ("05/2025 - 02/2026" → maggio 2025; solo l'anno → gennaio).
 * Stessa lettura del backend (Course::startOfPeriod); null se non c'è un anno leggibile.
 * @param {string} period
 * @returns {number|null} mese contato come anno * 12 + mese
 */
function periodStart(period) {
    const match = /(?:(\d{1,2})\/)?(\d{4})/.exec(period ?? "");
    if (!match) return null;

    const month = match[1] === undefined ? 1 : Number(match[1]);
    if (month < 1 || month > 12) return null;

    return Number(match[2]) * 12 + month;
}

/**
 * Dal corso iniziato più di recente al più vecchio, come fa il backend: a parità di inizio viene prima
 * quello con id maggiore, quelli senza data in fondo. Serve ai dati statici di riserva.
 * @param {Array} courses
 * @returns {Array} una copia ordinata
 */
export function sortCoursesByRecency(courses) {
    return [...courses].sort((a, b) => {
        const startA = periodStart(a.period);
        const startB = periodStart(b.period);

        if (startA === null && startB !== null) return 1;
        if (startA !== null && startB === null) return -1;
        if (startA !== startB) return startB - startA;

        return b.id - a.id;
    });
}
