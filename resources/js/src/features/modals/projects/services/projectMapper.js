import { getAssetPath } from "../../../../utils/assets";

const PLACEHOLDER_PREVIEW = getAssetPath("/modals/placeholder/project-placeholder.webp");

/**
 * Progetto dell'API → formato atteso da ProjectCard.
 * L'API non manda l'anteprima (le immagini non sono ancora gestite dal pannello):
 * qui si aggiunge il segnaposto, e `live` vuoto diventa "#" come prima.
 * @param {Object} project - progetto come restituito da /api/projects
 * @returns {Object} progetto per ProjectCard
 */
export function mapApiProject(project) {
    return {
        ...project,
        preview: PLACEHOLDER_PREVIEW,
        description: project.description ?? "",
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        live: project.live || "#",
        stars: project.stars ?? 0,
    };
}

/**
 * @param {Array} projects - progetti dell'API (già ordinati dal backend)
 * @returns {Array}
 */
export function mapApiProjects(projects) {
    return projects.map(mapApiProject);
}
