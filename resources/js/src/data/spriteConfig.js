import { getAssetPath } from '../utils/assets';
import { MODAL_IDS } from './uiConstants';

const monkeySprite = getAssetPath('/sprites/monkey.webp');
const monkeySpriteSm = getAssetPath('/sprites/monkey-sm.webp');
const monkeySpriteMd = getAssetPath('/sprites/monkey-md.webp');

const librarySprite = getAssetPath('/sprites/book.webp');
const librarySpriteSm = getAssetPath('/sprites/book-sm.webp');
const librarySpriteMd = getAssetPath('/sprites/book-md.webp');

const deskSprite = getAssetPath('/sprites/desk.webp');
const deskSpriteSm = getAssetPath('/sprites/desk-sm.webp');
const deskSpriteMd = getAssetPath('/sprites/desk-md.webp');

const parrotSprite = getAssetPath('/sprites/parrot.webp');
const parrotSpriteSm = getAssetPath('/sprites/parrot-sm.webp');
const parrotSpriteMd = getAssetPath('/sprites/parrot-md.webp');

const paintingSprite = getAssetPath('/sprites/painting.webp');
const paintingSpriteSm = getAssetPath('/sprites/painting-sm.webp');
const paintingSpriteMd = getAssetPath('/sprites/painting-md.webp');

const SPRITES = [
    {
        id: MODAL_IDS.ABOUT_ME,
        src: monkeySprite,
        srcSm: monkeySpriteSm,
        srcMd: monkeySpriteMd,
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
        srcSm: librarySpriteSm,
        srcMd: librarySpriteMd,
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
        srcSm: deskSpriteSm,
        srcMd: deskSpriteMd,
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
        srcSm: parrotSpriteSm,
        srcMd: parrotSpriteMd,
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
        srcSm: paintingSpriteSm,
        srcMd: paintingSpriteMd,
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
