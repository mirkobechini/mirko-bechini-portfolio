import skillsData from './skillsData';
import educationData from './educationData';
import { getAssetPath } from '../../../utils/assets';

const skillsProfileSprite = getAssetPath('/modals/skills/ui/library-modal.webp');
const formationProfileSprite = getAssetPath('/modals/skills/ui/library-modal.webp');

const BOOKSHELF_PROFILES = {
    skills: {
        id: 'skills',
        title: 'Competenze',
        detailsTitle: 'Dettagli skill',
        enableKeyboardNavigation: true,
        modalSprite: skillsProfileSprite,
        skillsData,
    },
    formation: {
        id: 'formation',
        title: 'Formazione',
        detailsTitle: 'Percorso e prossimi step',
        enableKeyboardNavigation: false,
        modalSprite: formationProfileSprite,
        educationData,
        formationFocus: [
            {
                title: 'Multistack AI Developer',
                description: 'Corso avanzato di sviluppo full-stack con integrazione di modelli AI, progettazione di sistemi complessi e sviluppo multipiattaforma.',
                status: 'inProgress',
                badge: 'New Skills',
            },
            {
                title: 'Learn Typescript',
                description: 'Corso Scrimba per imparare le basi di Typescript e tipizzazione statica.',
                status: 'onHold',
                badge: 'New Skill',
            },
        ],
        formationRoadmap: [
            {
                title: 'Creare backend Portfolio',
                description: 'Sviluppare un progetto backend completo per il portfolio, utilizzando Laravel o Node.js, per dimostrare le competenze acquisite e avere un caso studio da mostrare ai potenziali datori di lavoro.',
                status: 'next',
                badge: 'Portfolio',
            },
            {
                title: 'Improve Laravel skills',
                description: 'Approfondire Laravel con progetti pratici e corsi avanzati per diventare più efficiente nello sviluppo backend.',
                status: 'next',
                badge: 'Upgrade Skill',
            },
            {
                title: 'Learn Angular',
                description: 'Seguire un corso completo su Angular per ampliare le competenze frontend e imparare a costruire applicazioni complesse.',
                status: 'next',
                badge: 'New Skill',
            },
        ],
    },
};

export { BOOKSHELF_PROFILES };
