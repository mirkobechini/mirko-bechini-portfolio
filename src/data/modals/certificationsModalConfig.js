import { getAssetPath } from '../../utils/assets';

const paintingModal = getAssetPath('/modals/certifications/painting-modal.webp');

const certificationsModalConfig = {
    id: 4,
    title: 'Certificazioni',
    theme: 'painting',
    componentKey: 'certifications',
    sprite: paintingModal,
};

export default certificationsModalConfig;
