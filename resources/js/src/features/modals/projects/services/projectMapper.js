import { getAssetPath } from "../../../../utils/assets";
import { resolveAssetUrl } from "../../../../utils/assetUrl";

const PLACEHOLDER_PREVIEW = getAssetPath("/modals/placeholder/project-placeholder.webp");

/**
 * Progetto dell'API → formato atteso da ProjectCard.
 * L'anteprima è quella caricata dal pannello, se c'è; altrimenti il segnaposto. `live` vuoto diventa "#" come prima.
 * @param {Object} project - progetto come restituito da /api/projects
 * @returns {Object} progetto per ProjectCard
 */
export function mapApiProject(project) {
    const customPreview = resolveAssetUrl(project.preview);

    return {
        ...project,
        preview: customPreview ?? PLACEHOLDER_PREVIEW,
        // La card mostra l'immagine solo se è stata caricata davvero, non il segnaposto
        hasCustomPreview: customPreview !== null,
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
