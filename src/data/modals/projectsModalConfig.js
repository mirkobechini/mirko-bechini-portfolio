import { getAssetPath } from '../../utils/assets';

const deskModal = getAssetPath('/modals/projects/desk-modal.png');

const projectsModalConfig = {
    id: 3,
    title: 'Esperienze & Progetti',
    theme: 'desk',
    componentKey: 'projects',
    sprite: deskModal,
};

export default projectsModalConfig;
