import { getAssetPath } from '../utils/assets';
import { MODAL_IDS } from './uiConstants';

const monkeySprite = getAssetPath('/sprites/monkey.webp');
const librarySprite = getAssetPath('/sprites/book.webp');
const deskSprite = getAssetPath('/sprites/desk.webp');
const parrotSprite = getAssetPath('/sprites/parrot.webp');
const paintingSprite = getAssetPath('/sprites/painting.webp');

const SPRITES = [
    {
        id: MODAL_IDS.ABOUT_ME,
        src: monkeySprite,
        className: 'monkey',
        label: 'Chi Sono',
        ariaLabel: 'Sezione Chi Sono',
        title: 'About me',
        alt: 'Scimmia sezione Chi Sono',
        fetchPriority: 'high',
        loading: 'eager',
        width: 480,
        height: 550,
    },
    {
        id: MODAL_IDS.BOOKSHELF,
        src: librarySprite,
        className: 'library',
        label: 'Formazione & Competenze',
        ariaLabel: 'Sezione Formazione & Competenze',
        title: 'Formation & Skills',
        alt: 'Libreria sezione Formazione & Competenze',
        fetchPriority: 'low',
        loading: 'lazy',
        width: 572,
        height: 538,
    },
    {
        id: MODAL_IDS.PROJECTS,
        src: deskSprite,
        className: 'desk',
        label: 'Esperienze & Progetti',
        ariaLabel: 'Sezione Esperienze & Progetti',
        title: 'Experiences & Projects',
        alt: 'Scrivania sezione Esperienze & Progetti',
        fetchPriority: 'low',
        loading: 'lazy',
        width: 726,
        height: 553,
    },
    {
        id: MODAL_IDS.CONTACTS,
        src: parrotSprite,
        className: 'parrot',
        label: 'Contatti',
        ariaLabel: 'Sezione Contatti',
        title: 'Contacts',
        alt: 'Pappagallo sezione Contatti',
        fetchPriority: 'low',
        loading: 'lazy',
        width: 471,
        height: 538,
    },
    {
        id: MODAL_IDS.CERTIFICATIONS,
        src: paintingSprite,
        className: 'painting',
        label: 'Certificazioni',
        ariaLabel: 'Sezione Certificazioni',
        title: 'Certifications',
        alt: 'Quadro sezione Certificazioni',
        fetchPriority: 'low',
        loading: 'lazy',
        width: 605,
        height: 518,
    },
];

export default SPRITES;
