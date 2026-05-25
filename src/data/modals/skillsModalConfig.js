import { getAssetPath } from '../../utils/assets';

const libraryModal = getAssetPath('/modals/skills/modal/library-modal.png');

const skillsModalConfig = {
    id: 2,
    title: 'Formazione & Competenze',
    theme: 'library',
    componentKey: 'bookshelf',
    sprite: libraryModal,
};

export default skillsModalConfig;
