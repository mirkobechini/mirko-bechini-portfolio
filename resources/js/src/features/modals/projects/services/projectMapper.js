import { getAssetPath } from "../../../../utils/assets";
import projectsMeta from "./projectsMeta";

const PLACEHOLDER_PREVIEW = getAssetPath("/modals/placeholder/project-placeholder.webp");

/**
 * Mappa un repo GitHub grezzo + metadati locali → formato ProjectCard.
 * @param {Object} repo - Repo GitHub grezzo dall'API
 * @param {Object} meta - Metadati da projectsMeta.js
 * @returns {Object} progetto nel formato atteso da ProjectCard
 */
export function mapRepoToProject(repo, meta) {
    const technologies = buildTechnologies(repo, meta);

    return {
        id: repo.name,
        title: repo.name,
        description: meta.description || repo.description || "",
        preview: meta.preview || PLACEHOLDER_PREVIEW,
        projectScope: meta.projectScope || "personal",
        type: meta.type || "fullstack",
        technologies,
        repo: repo.html_url,
        live: meta.live || repo.homepage || "#",
        stars: repo.stargazers_count ?? 0,
        updatedAt: repo.pushed_at || repo.updated_at,
    };
}

/**
 * Costruisce l'array technologies unendo: linguaggio principale, topics GitHub, extra dal meta.
 */
function buildTechnologies(repo, meta) {
    const techSet = new Set();

    // Linguaggio principale
    if (repo.language) {
        techSet.add(repo.language);
    }

    // Topics da GitHub
    if (Array.isArray(repo.topics)) {
        repo.topics.forEach((t) => techSet.add(t));
    }

    // Tecnologie extra dal mapping locale
    if (Array.isArray(meta.extraTechnologies)) {
        meta.extraTechnologies.forEach((t) => techSet.add(t));
    }

    return Array.from(techSet);
}

/**
 * Filtra i repo GitHub usando il mapping locale:
 * - Esclude repo con `exclude: true` in projectsMeta
 * - Include repo che NON hanno un entry in projectsMeta (nuovi repo)
 * @param {Array} repos - Array di repo GitHub grezzi
 * @returns {Array} repo filtrati
 */
export function filterRepos(repos) {
    return repos.filter((repo) => {
        const meta = projectsMeta[repo.name];
        // Se ha un entry con exclude: true, salta
        if (meta && meta.exclude) return false;
        return true;
    });
}

/**
 * Prende array di repo GitHub grezzi e restituisce progetti nel formato atteso.
 * @param {Array} repos - Array di repo GitHub grezzi
 * @returns {Array} progetti formattati
 */
export function transformRepos(repos) {
    const filtered = filterRepos(repos);

    const projects = filtered.map((repo) => {
        const meta = projectsMeta[repo.name] || {};
        return mapRepoToProject(repo, meta);
    });

    // Ordina prima i repo con le modifiche più recenti
    return projects.sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
    });
}