const projectData = [
    {
        id: 1,
        title: 'Gods Backoffice',
        description: 'Backend realizzato come esame finale del corso Boolean. Include CRUD completo, gestione API per interazione con front-end, autenticazione Breeze e gestione relazioni DB.',
        preview: 'https://via.placeholder.com/300x200',
        company: "boolean",
        type: "backend",
        technologies: ['PHP', 'Laravel', 'Blade', 'MySQL', 'Breeze', 'Bootstrap', 'API'],
        repo: 'https://github.com/mirkobechini/gods-backoffice',
        demo: "#"
    },
    {
        id: 2,
        title: 'Gods Guest Site',
        description: 'Frontend per esame del corso Boolean permette di consultare le varie mitologie e dei ricevuti tramite chiamate axios a API REST, caratterizzato da design responsive, dark mode e animazioni.',
        preview: 'https://via.placeholder.com/300x200',
        company: "boolean",
        type: "frontend",
        technologies: ['React', 'Axios', 'HTML', 'CSS', 'Bootstrap', 'JS'], //tecnologie categorizzate in frontend e backend ed hanno codice colore
        repo: 'https://github.com/mirkobechini/gods-guest-site',
        demo: "#"
    },
    {
        id: 3,
        title: 'CV Backoffice',
        description: 'Gestione flotta mezzi con monitoraggio delle scadenze, gestione di eventuali guasti, log chilometrici, registrazione e gestione dell’equipaggiamento di ogni mezzo.',
        preview: 'https://via.placeholder.com/300x200',
        company: "personal",
        type: "backend",
        technologies: ['PHP', 'Laravel', 'Blade', 'Breeze', 'Bootstrap', 'MySQL'],
        repo: 'https://github.com/mirkobechini/CV_Backoffice',
        demo: "#"
    }
];

export default projectData;