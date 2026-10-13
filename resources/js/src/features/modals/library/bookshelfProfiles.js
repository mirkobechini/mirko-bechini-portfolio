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
    },
};

export { BOOKSHELF_PROFILES };
