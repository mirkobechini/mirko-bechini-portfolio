import { lazy } from 'react';
import aboutModalConfig from './about/aboutModalConfig';
import libraryModalConfig from './library/libraryModalConfig';
import projectsModalConfig from './projects/projectsModalConfig';
import certificationsModalConfig from './certifications/certificationsModalConfig';
import contactsModalConfig from './contacts/contactsModalConfig';

// Lazy load componenti modali
const AboutMeModal = lazy(() => import('./about/AboutMeModal'));
const BookshelfModal = lazy(() => import('./library/BookshelfModal'));
const ProjectExperienceModal = lazy(() => import('./projects/ProjectExperienceModal'));
const CertificationsModal = lazy(() => import('./certifications/CertificationsModal'));
const ContactsModal = lazy(() => import('./contacts/ContactsModal'));

const MODAL_COMPONENTS = {
    aboutMe: AboutMeModal,
    bookshelf: BookshelfModal,
    projects: ProjectExperienceModal,
    certifications: CertificationsModal,
    contacts: ContactsModal,
};

const MODAL_CONFIGS = [
    aboutModalConfig,
    libraryModalConfig,
    projectsModalConfig,
    certificationsModalConfig,
    contactsModalConfig,
];

const MODAL_DATA = MODAL_CONFIGS.map((config) => ({
    ...config,
    component: MODAL_COMPONENTS[config.componentKey],
}));

export default MODAL_DATA;
