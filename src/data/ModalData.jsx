import { lazy } from 'react';

import monkeyModal from '/assets/modals/monkey-modal.png';
import libraryModal from '/assets/modals/library-modal.png';
import deskModal from '/assets/modals/desk-modal.png';
import paintingModal from '/assets/modals/painting-modal.png';
import parrotModal from '/assets/modals/parrot-modal.png';

// Lazy load componenti modali
const AboutMeModal = lazy(() => import('../components/ui/modals/AboutMeModal'));
const SkillsModal = lazy(() => import('../components/ui/modals/SkillsModal'));
const ProjectsModal = lazy(() => import('../components/ui/modals/ProjectsModal'));
const CertificationsModal = lazy(() => import('../components/ui/modals/CertificationsModal'));
const ContactsModal = lazy(() => import('../components/ui/modals/ContactsModal'));

const MODAL_DATA = [
    {
        id: 1,
        title: 'About Me',
        component: AboutMeModal,
        theme: "monkey",
        picture: monkeyModal
    },
    {
        id: 2,
        title: 'Formazione & Competenze',
        component: SkillsModal,
        theme: "library",
        picture: libraryModal
    },
    {
        id: 3,
        title: 'Esperienze & Progetti',
        component: ProjectsModal,
        theme: "desk",
        picture: deskModal
    },
    {
        id: 4,
        title: 'Certificazioni',
        component: CertificationsModal,
        theme: "painting",
        picture: paintingModal
    },
    {
        id: 5,
        title: 'Contatti',
        component: ContactsModal,
        theme: "parrot",
        picture: parrotModal
    },
];

export default MODAL_DATA;