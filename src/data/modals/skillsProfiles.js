import skillsData from '../skillsData';
import educationData from '../educationData';

const SKILLS_MODAL_PROFILES = {
    skills: {
        id: 'skills',
        title: 'Competenze',
        enableKeyboardNavigation: true,
        skillsData,
    },
    formation: {
        id: 'formation',
        title: 'Formazione',
        enableKeyboardNavigation: false,
        educationData,
    },
};

export { SKILLS_MODAL_PROFILES };
