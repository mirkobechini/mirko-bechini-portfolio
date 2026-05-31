import skillsData from '../skillsData';
import educationData from '../educationData';
import { getAssetPath } from '../../utils/assets';

const skillsProfileSprite = getAssetPath('/modals/skills/ui/library-modal.png');
const formationProfileSprite = getAssetPath('/modals/skills/ui/library-modal.png');

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
                title: 'Specializzazione backend',
                description: 'Percorso full-stack con focus su PHP, Laravel e progettazione API.',
                status: 'done',
                badge: 'Core stack',
            },
            {
                title: 'Approccio pratico',
                description: 'Allenamento continuo su progetti reali, debug e miglioramento iterativo.',
                status: 'inProgress',
                badge: 'Hands-on',
            },
            {
                title: 'Frontend moderno',
                description: 'Consolidamento ecosistema React, Vite e component architecture.',
                status: 'inProgress',
                badge: 'UI stack',
            },
        ],
        formationRoadmap: [
            {
                title: 'Definire milestones profilo formation',
                description: 'Formalizzare obiettivi trimestrali e criteri di avanzamento.',
                status: 'next',
                badge: 'Planning',
            },
            {
                title: 'Timeline visuale',
                description: 'Aggiungere blocchi visuali con milestone, badge e progress tracking.',
                status: 'next',
                badge: 'UX',
            },
            {
                title: 'Connessione ai progetti',
                description: 'Collegare ogni step del percorso a case study e repository pertinenti.',
                status: 'next',
                badge: 'Portfolio',
            },
        ],
    },
};

export { BOOKSHELF_PROFILES };
