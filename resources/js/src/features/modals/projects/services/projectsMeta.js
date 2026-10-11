/**
 * Metadati locali dei progetti.
 * Contiene solo ciò che GitHub NON può fornire:
 * - type (frontend / backend / fullstack)
 * - projectScope (personal / work)
 * - description in italiano
 * - live URL personalizzato (se diverso dalla homepage GitHub)
 * - extraTechnologies: tecnologie non rilevate da GitHub (es. AI, Figma, Tauri)
 * - exclude: true per nascondere il repo (fork, esercizi, config, etc.)
 * - pinned: true per mettere il progetto in cima (ordinamento manuale)
 *
 * La chiave è il nome repo su GitHub (case-sensitive).
 */
const projectsMeta = {
    "gods-backoffice": {
        type: "backend",
        projectScope: "work",
        extraTechnologies: [],
        description: "Backend realizzato come esame finale del corso Boolean. Include CRUD completo, gestione API per interazione con front-end, autenticazione Breeze e gestione relazioni DB.",
    },
    "gods-guest-site": {
        type: "frontend",
        projectScope: "work",
        extraTechnologies: ["Axios"],
        description: "Frontend per esame del corso Boolean permette di consultare le varie mitologie e dei ricevuti tramite chiamate axios a API REST, caratterizzato da design responsive, dark mode e animazioni.",
    },
    "CV_Backoffice": {
        type: "backend",
        projectScope: "personal",
        pinned: true,
        extraTechnologies: [],
        description: "Gestione flotta mezzi con monitoraggio delle scadenze, gestione di eventuali guasti, log chilometrici, registrazione e gestione dell'equipaggiamento di ogni mezzo.",
    },
    "digital-business-card": {
        type: "frontend",
        projectScope: "personal",
        extraTechnologies: [],
        description: "Biglietto da visita digitale realizzato in React come esercizio del corso React di Scrimba.",
        live: "https://mirkobechini.github.io/digital-business-card/",
    },
    tenzies: {
        type: "frontend",
        projectScope: "personal",
        extraTechnologies: ["Figma"],
        description: "Gioco di dadi realizzato in React come esercizio del corso React di Scrimba.",
        live: "https://mirkobechini.github.io/tenzies/",
    },
    "assembly-endgame": {
        type: "frontend",
        projectScope: "personal",
        extraTechnologies: ["Figma"],
        description: "Sito web per un progetto di gioco da tavolo, realizzato in React come esercizio del corso React di Scrimba.",
        live: "https://mirkobechini.github.io/assembly-endgame/",
    },
    quizzical: {
        type: "frontend",
        projectScope: "personal",
        extraTechnologies: ["Figma"],
        description: "Quiz interattivo realizzato in React come esercizio del corso React di Scrimba.",
        live: "https://mirkobechini.github.io/quizzical/",
    },
    "mirko-bechini-portfolio": {
        type: "fullstack",
        projectScope: "personal",
        pinned: true,
        extraTechnologies: ["CSS Animations", "PWA"],
        description: "Portfolio personale realizzato in React con Vite, progettato per mostrare il mio percorso e le mie competenze.",
    },
    pdfEditor: {
        type: "fullstack",
        projectScope: "personal",
        pinned: true,
        extraTechnologies: ["AI", "Next.js", "React Native", "Tauri", "FastAPI", "Python", "TypeScript", "TailwindCSS"],
        description: "Applicazione cross-platform per la modifica e gestione di file PDF, con funzionalità di visualizzazione, annotazione, conversione, modifica testo e manipolazione avanzata. Architettura modulare che copre web (Next.js), desktop (Tauri v2), mobile (React Native) e backend (FastAPI).",
    },
    "nasa-neam": {
        type: "fullstack",
        projectScope: "personal",
        extraTechnologies: ["AI", "Next.js", "SQLite", "Three.js", "NASA API"],
        description: "Webapp per monitorare asteroidi near-Earth usando l'API gratuita NASA NeoWs, con visualizzazioni interattive, alert system e risorse educative. Singolo deploy su Vercel.",
    },
    "agent-skills": {
        type: "fullstack",
        projectScope: "personal",
        pinned: true,
        extraTechnologies: ["AI", "Python"],
        description: "Repo con le varie skill sviluppate per l'AI Agent.",
    },
};

export default projectsMeta;