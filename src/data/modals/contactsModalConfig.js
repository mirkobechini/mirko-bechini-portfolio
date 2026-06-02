import { getAssetPath } from '../../utils/assets';

const parrotModal = getAssetPath('/modals/contacts/parrot-modal.webp');

const contactsModalConfig = {
    id: 5,
    title: 'Contatti',
    theme: 'parrot',
    componentKey: 'contacts',
    sprite: parrotModal,
};

export default contactsModalConfig;
