import { getAssetPath } from '../../../utils/assets';

const educationData = [
    {
        id: 1,
        course: 'Web development part-time specializzazione PHP e Laravel',
        description: "Corso online di 9 mesi con specializzazione in PHP e Laravel. Oltre 350 ore di lezioni e progetti pratici, culminati in uno stage finale con sviluppo di applicazioni web complete.",
        certificate: 'https://cdn.certifier.io/fa42c19f-1139-4574-ac7a-83b13341a48e/credentials/01kjpz4adz63kdjmb8dvkkvqkp/designs/01kecgnrmxpmnwpapcy6fqm34w/EaIJLLzwYX.png',
        organization: 'Boolean',
        organizationUrl: 'https://boolean.careers',
        period: '05/2025 - 02/2026',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MySQL', 'PHP', 'Laravel'],
        highlights: [
            'Esame finale con sviluppo di un backoffice completo in Laravel',
            'Oltre 350 ore di formazione pratica',
            'Specializzazione full-stack con focus su Laravel',
        ],
        modules: [
            {
                title: 'Fundamentals',
                description: 'Basi di programmazione, HTML, CSS e JavaScript.',
                skillsModules: ['HTML', 'CSS', 'JavaScript'],
            },
            {
                title: 'Frontend avanzato',
                description: 'React, componenti, stato e routing.',
                skillsModules: ['React'],
            },
            {
                title: 'Backend',
                description: 'Node.js, Express, MySQL e creazione di API RESTful.',
                skillsModules: ['Node.js', 'Express', 'MySQL'],
            },
            {
                title: 'Specializzazione PHP & Laravel',
                description: 'PHP moderno, Laravel MVC, Eloquent ORM, Blade, Breeze.',
                skillsModules: ['PHP', 'Laravel'],
            },
        ],
    },
    {
        id: 2,
        course: 'LEARN REACT',
        description: 'Corso intensivo di React con progetti pratici e interattivi, completato in poche settimane.',
        certificate: getAssetPath('/modals/certifications/certificato-react-scrimba.webp'),
        organization: 'Scrimba',
        organizationUrl: 'https://scrimba.com/learn-react-c0e',
        period: '03/2026 - 03/2026',
        skills: ['React'],
        highlights: [
            'Corso intensivo completato in poche settimane',
            'Componenti funzionali, hooks e state management',
            'Progetti pratici interattivi integrati nella piattaforma',
        ],
        modules: [
            {
                title: 'React Basics',
                description: 'JSX, componenti, props, rendering condizionale e liste.',
                skillsModules: ['React'],
            },
            {
                title: 'Hooks & State',
                description: 'useState, useEffect, useRef e custom hooks.',
                skillsModules: ['React'],
            },
            {
                title: 'Advanced Patterns',
                description: 'Context API, useReducer, performance optimization.',
                skillsModules: ['React'],
            },
        ],
    },
    {
        id: 3,
        course: 'LEARN TYPESCRIPT',
        description: 'Corso completo di TypeScript con focus su tipizzazione statica e integrazione con progetti React.',
        certificate: getAssetPath('/modals/certifications/certificato-typescript-scrimba.webp'),
        organization: 'Scrimba',
        organizationUrl: 'https://scrimba.com/learn-typescript',
        period: '03/2026 - current',
        skills: ['TypeScript'],
        highlights: [
            'Corso in corso di completamento',
            'Tipizzazione statica e interfacce',
            'Integrazione con progetti React esistenti',
        ],
        modules: [
            {
                title: 'TypeScript Fundamentals',
                description: 'Tipi di base, interfacce, union types e type aliases.',
                skillsModules: ['TypeScript'],
            },
            {
                title: 'Advanced Types',
                description: 'Generics, utility types, type narrowing e mapped types.',
                skillsModules: ['TypeScript'],
            },
            {
                title: 'TypeScript con React',
                description: 'Tipizzazione di componenti, hooks, eventi e contesto.',
                skillsModules: ['TypeScript'],
            },
        ],
    },
    {
        id: 4,
        course: 'Multistack AI Developer',
        description: 'Corso avanzato di sviluppo full-stack con integrazione di modelli AI, progettazione di sistemi complessi e sviluppo multipiattaforma.',
        certificate: '',
        organization: 'Online',
        organizationUrl: '',
        period: '05/2026 - current',
        skills: ['AI'],
        highlights: [
            'In corso di completamento',
            'Sviluppo di progetti full-stack con AI',
            'Progettazione di sistemi complessi e multipiattaforma',
            'Creazione di Skills, Brief e ADR per agenti AI',
            'Utilizzo di AI per generare codice, contenuti e assistenza alla scrittura',
            'Integrazione di AI in progetti web e applicazioni',
            'System Thinking e problem-solving con AI',
        ],
        modules: [
            {
                title: 'Pre-Corso / Setup',
                description: 'Git, VS Code, Copilot, Ollama — strumenti e ambiente di sviluppo.',
                skillsModules: ['AI'],
            },
            {
                title: 'Mindset Multistack',
                description: 'Modello a 2 strati, Brief, Workflow — approccio multipiattaforma.',
                skillsModules: ['AI'],
            },
            {
                title: 'Systems Thinking',
                description: 'Architettura, decisioni, trade-off — progettare sistemi complessi.',
                skillsModules: ['AI'],
            },
            {
                title: 'Web',
                description: 'Build completo — dal brief al deploy di un\'applicazione web.',
                skillsModules: ['AI'],
            },
            {
                title: 'Desktop',
                description: 'App native con agenti — sviluppo per desktop con integrazione AI.',
                skillsModules: ['AI'],
            },
            {
                title: 'Mobile',
                description: 'Cross-platform development — app mobile con framework moderni.',
                skillsModules: ['AI'],
            },
            {
                title: 'Dati e API',
                description: 'Backend, database, integrazioni — gestione dati e API.',
                skillsModules: ['AI'],
            },
            {
                title: 'AI Locale',
                description: 'Ollama, modelli, tool building — AI eseguita in locale.',
                skillsModules: ['AI'],
            },
            {
                title: 'Multipiattaforma',
                description: 'Un progetto, più target — codice condiviso tra web, desktop e mobile.',
                skillsModules: ['AI'],
            },
            {
                title: 'Progetto Finale',
                description: 'Build autonomo end-to-end — progetto completo dall\'idea al rilascio.',
                skillsModules: ['AI'],
            },
            {
                title: 'Presenta e Rifletti',
                description: 'Demo day, peer review — presentazione e revisione del progetto finale.',
                skillsModules: ['AI'],
            },
        ],
    }
];

export default educationData;
