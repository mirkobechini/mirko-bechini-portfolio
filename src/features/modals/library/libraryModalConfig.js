import { getAssetPath } from '../../../utils/assets';

const bookshelfModal = getAssetPath('/modals/bookshelf/books-monkey.webp');

const libraryModalConfig = {
    id: 2,
    title: 'Formazione & Competenze',
    theme: 'library',
    componentKey: 'bookshelf',
    sprite: bookshelfModal,
};

export default libraryModalConfig;
