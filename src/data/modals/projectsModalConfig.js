const ASSETS = import.meta.env.VITE_ASSETS_PATH;
const deskModal = ASSETS + '/modals/projects/desk-modal.png';

const projectsModalConfig = {
    id: 3,
    title: 'Esperienze & Progetti',
    theme: 'desk',
    componentKey: 'projects',
    sprite: deskModal,
};

export default projectsModalConfig;
