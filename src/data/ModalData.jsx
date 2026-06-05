import { lazy } from 'react';
import aboutMeModalConfig from './modals/aboutMeModalConfig';
import skillsModalConfig from './modals/skillsModalConfig';
import projectsModalConfig from './modals/projectsModalConfig';
import certificationsModalConfig from './modals/certificationsModalConfig';
import contactsModalConfig from './modals/contactsModalConfig';

// Lazy load componenti modali
const AboutMeModal = lazy(() => import('../features/modals/about/AboutMeModal'));
const BookshelfModal = lazy(() => import('../features/modals/library/BookshelfModal'));
const ProjectExperienceModal = lazy(() => import('../features/modals/projects/ProjectExperienceModal'));
const CertificationsModal = lazy(() => import('../features/modals/certifications/CertificationsModal'));
const ContactsModal = lazy(() => import('../features/modals/contacts/ContactsModal'));

const MODAL_COMPONENTS = {
    aboutMe: AboutMeModal,
    bookshelf: BookshelfModal,
    projects: ProjectExperienceModal,
    certifications: CertificationsModal,
    contacts: ContactsModal,
};

const MODAL_CONFIGS = [
    aboutMeModalConfig,
    skillsModalConfig,
    projectsModalConfig,
    certificationsModalConfig,
    contactsModalConfig,
];

const MODAL_DATA = MODAL_CONFIGS.map((config) => ({
    ...config,
    component: MODAL_COMPONENTS[config.componentKey],
}));

export default MODAL_DATA;
