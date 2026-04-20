import monkeyModal from '/assets/modals/monkey-modal.png';

import AboutMeModal from '../components/ui/modals/AboutMeModal';
import SkillsModal from '../components/ui/modals/SkillsModal';
import ProjectsModal from '../components/ui/modals/ProjectsModal';
import CertificationsModal from '../components/ui/modals/CertificationsModal';
import ContactsModal from '../components/ui/modals/ContactsModal';




const MODAL_DATA = [
    {
        id: 1,
        title: 'About Me',
        content: (<AboutMeModal />),
        theme: "monkey",
        picture: monkeyModal
    },
    {
        id: 2,
        title: 'Formazione & Competenze',
        content: (<SkillsModal />),
        theme: "library",
        picture: "/assets/modals/library-modal.png"

    },
    {
        id: 3,
        title: 'Esperienze & Progetti',
        content: (<ProjectsModal />),
        theme: "desk",
        picture: "/assets/modals/desk-modal.png"
    },
    {
        id: 4,
        title: 'Certificazioni',
        content: (<CertificationsModal />),
        theme: "painting",
        picture: "/assets/modals/painting-modal.png"
    },
    {
        id: 5,
        title: 'Contatti',
        content: (<ContactsModal />),
        theme: "parrot",
        picture: "/assets/modals/parrot-modal.png"
    },
];

export default MODAL_DATA;