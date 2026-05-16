const ASSETS = import.meta.env.VITE_ASSETS_PATH;
const libraryModal = ASSETS + '/modals/skills/modal/library-modal.png';

const skillsModalConfig = {
    id: 2,
    title: 'Formazione & Competenze',
    theme: 'library',
    componentKey: 'skills',
    sprite: libraryModal,
};

export default skillsModalConfig;
