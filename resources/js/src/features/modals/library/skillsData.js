import { getAssetPath } from '../../../utils/assets';

const skillsData = [
    {
        id: 1,
        skill: 'HTML',
        icon: getAssetPath('/modals/skills/icons/html.webp'),
        category: 'Mark-up',
        color: '#E34F26',
        functions: [
            'Strutturazione di pagine web semantiche',
            'Utilizzo di tag HTML5 per migliorare l’accessibilità',
            'Integrazione di media come immagini e video',
        ],
        relatedProjects: [
            'Portfolio personale',
            'Gods Guest Site',
        ],
    },
    {
        id: 2,
        skill: 'CSS',
        icon: getAssetPath('/modals/skills/icons/css.webp'),
        category: 'Mark-up',
        color: '#1572B6',
        functions: [
            'Stilizzazione di pagine web',
            'Utilizzo di CSS3 per layout responsive',
            'Animazioni e transizioni',
        ],
        relatedProjects: [
            'Portfolio personale',
            'Gods Guest Site',
        ],
    },
    {
        id: 3,
        skill: 'JavaScript',
        icon: getAssetPath('/modals/skills/icons/javascript.webp'),
        category: 'Frontend',
        color: '#F7DF1E',
        functions: [
            'Manipolazione del DOM',
            'Gestione di eventi',
            'Creazione di interattività',
            'Utilizzo di ES6+ per migliorare la leggibilità del codice',
        ],
        relatedProjects: [
            'Portfolio personale',
            'Gods Guest Site',
        ],
    },
    {
        id: 4,
        skill: 'React',
        icon: getAssetPath('/modals/skills/icons/react.webp'),
        category: 'Library',
        color: '#61DAFB',
        functions: [
            'Creazione di componenti riutilizzabili',
            'Gestione dello stato con useState e useReducer',
            'Effetti collaterali con useEffect',
            'Routing con React Router',
            'Integrazione con API esterne',
        ],
        relatedProjects: [
            'Portfolio personale',
            'Gods Guest Site',
        ],
    },
    {
        id: 5,
        skill: 'Node.js',
        icon: getAssetPath('/modals/skills/icons/node.webp'),
        category: 'Backend',
        color: '#339933',
    },
    {
        id: 6,
        skill: 'Express',
        icon: getAssetPath('/modals/skills/icons/express.webp'),
        category: 'Framework',
        color: '#000',
    },
    {
        id: 7,
        skill: 'MySQL',
        icon: getAssetPath('/modals/skills/icons/mysql.webp'),
        category: 'Database',
        color: '#4479A1',
        functions: [
            'Progettazione di database relazionali',
            'Creazione di tabelle e relazioni',
            'Scrittura di query SQL per CRUD',
        ],
        relatedProjects: [
            'Gods Backoffice',
            'CV Backoffice',
        ],
    },
    {
        id: 8,
        skill: 'PHP',
        icon: getAssetPath('/modals/skills/icons/php.webp'),
        category: 'Backend',
        color: '#777BB4',
        functions: [
            'Sviluppo di logica server-side',
            'Integrazione con database MySQL',
            'Creazione di API RESTful',
        ],
        relatedProjects: [
            'Gods Backoffice',
            'CV Backoffice',
        ],
    },
    {
        id: 9,
        skill: 'Laravel',
        icon: getAssetPath('/modals/skills/icons/laravel.webp'),
        category: 'Framework',
        color: '#FF2D20',
        functions: [
            'Sviluppo di applicazioni web MVC',
            'Gestione di routing e middleware',
            'Integrazione con database e ORM Eloquent',
            'Livewire per interattività senza JavaScript',
            'Utilizzo di Blade per templating',
            'Sicurezza con autenticazione e autorizzazione (Breeze)',
            'Testing con PHPUnit',
            'Observer per eventi del modello',
            'Form request per validazione',
        ],
        relatedProjects: [
            'Gods Backoffice',
            'CV Backoffice',
        ],
    },
    {
        id: 10,
        skill: 'Git',
        icon: getAssetPath('/modals/skills/icons/git.webp'),
        category: 'Version Control',
        color: '#F05032',
        functions: [
            'Controllo delle versioni del codice',
            'Gestione di branch e merge',
        ],
        relatedProjects: [
            'Tutti i progetti',
        ],
    },
    {
        id: 11,
        skill: 'GitHub',
        icon: getAssetPath('/modals/skills/icons/github.webp'),
        category: 'Version Control',
        color: '#181717',
        functions: [
            'Hosting di repository Git',
            'Collaborazione con pull request e issues',
        ],
        relatedProjects: [
            'Tutti i progetti',
        ],
    },
    {
        id: 12,
        skill: 'VS Code',
        icon: getAssetPath('/modals/skills/icons/vscode.webp'),
        category: 'IDE',
        color: '#007ACC',
        functions: [
            'Editing and debugging code',
            'Using extensions for productivity',
        ],
        relatedProjects: [
            'Tutti i progetti',
        ],
    },
    {
        id: 13,
        skill: 'Vite',
        icon: getAssetPath('/modals/skills/icons/vite.webp'),
        category: 'Build Tool',
        color: '#646CFF',
        functions: [
            'Development server con hot module replacement',
            'Build ottimizzato per produzione',
        ],
        relatedProjects: [
            'Portfolio personale',
            'Gods Guest Site',
        ],
    },
    {
        id: 14,
        skill: 'Postman',
        icon: getAssetPath('/modals/skills/icons/postman.webp'),
        category: 'API Testing',
        color: '#FF6C37',
        functions: [
            'Testing di API RESTful',
            'Creazione di collezioni di test',
        ],
        relatedProjects: [
            'Gods Backoffice',
        ],
    },
    {
        id: 15,
        skill: 'Copilot',
        icon: getAssetPath('/modals/skills/icons/copilot.webp'),
        category: 'AI Tool',
        color: '#00BFFF',
        functions: [
            'Generazione di codice basata su AI',
            'Suggerimenti intelligenti durante la scrittura del codice',
        ],
        relatedProjects: [
            'CV Backoffice',
            'Portfolio personale',
        ],
    },
    {
        id: 16,
        skill: 'Gemini',
        icon: getAssetPath('/modals/skills/icons/gemini.webp'),
        category: 'AI Tool',
        color: '#FFD700',
        functions: [
            'Generazione di codice basata su AI',
            'Generazione di contenuti e assistenza alla scrittura',
        ],
        relatedProjects: [
            'Gods Backoffice',
            'Gods Guest Site',
            'CV Backoffice',
            'Portfolio personale',
        ],
    },
    {
        id: 17,
        skill: 'TypeScript',
        icon: getAssetPath('/modals/skills/icons/typescript.webp'),
        category: 'Programming Language',
        color: '#3178C6',
        details: 'Still learning',
    }
];

export default skillsData;
