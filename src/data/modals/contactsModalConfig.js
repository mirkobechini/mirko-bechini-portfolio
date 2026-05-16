const ASSETS = import.meta.env.VITE_ASSETS_PATH;
const parrotModal = ASSETS + '/modals/contacts/parrot-modal.png';

const contactsModalConfig = {
    id: 5,
    title: 'Contatti',
    theme: 'parrot',
    componentKey: 'contacts',
    sprite: parrotModal,
};

export default contactsModalConfig;
