/**
 * Passi della pagina "Percorso e prossimi step": dati statici di riserva, usati solo se la API non
 * risponde (la fonte vera è il database, modificabile da /admin).
 * `kind` dice in quale colonna va: "focus" (Focus attuale) o "roadmap".
 */
const formationStepsData = [
    {
        id: 1,
        kind: 'focus',
        title: 'Multistack AI Developer',
        description: 'Corso avanzato di sviluppo full-stack con integrazione di modelli AI, progettazione di sistemi complessi e sviluppo multipiattaforma.',
        status: 'inProgress',
        badge: 'New Skills',
    },
    {
        id: 2,
        kind: 'focus',
        title: 'Learn Typescript',
        description: 'Corso Scrimba per imparare le basi di Typescript e tipizzazione statica.',
        status: 'onHold',
        badge: 'New Skill',
    },
    {
        id: 3,
        kind: 'roadmap',
        title: 'Creare backend Portfolio',
        description: 'Sviluppare un progetto backend completo per il portfolio, utilizzando Laravel o Node.js, per dimostrare le competenze acquisite e avere un caso studio da mostrare ai potenziali datori di lavoro.',
        status: 'next',
        badge: 'Portfolio',
    },
    {
        id: 4,
        kind: 'roadmap',
        title: 'Improve Laravel skills',
        description: 'Approfondire Laravel con progetti pratici e corsi avanzati per diventare più efficiente nello sviluppo backend.',
        status: 'next',
        badge: 'Upgrade Skill',
    },
    {
        id: 5,
        kind: 'roadmap',
        title: 'Learn Angular',
        description: 'Seguire un corso completo su Angular per ampliare le competenze frontend e imparare a costruire applicazioni complesse.',
        status: 'next',
        badge: 'New Skill',
    },
];

export default formationStepsData;
