import { lazy } from 'react';
import aboutMeModalConfig from './modals/aboutMeModalConfig';
import skillsModalConfig from './modals/skillsModalConfig';
import projectsModalConfig from './modals/projectsModalConfig';
import certificationsModalConfig from './modals/certificationsModalConfig';
import contactsModalConfig from './modals/contactsModalConfig';

// Lazy load componenti modali
const AboutMeModal = lazy(() => import('../components/ui/modals/AboutMeModal'));
const SkillsModal = lazy(() => import('../components/ui/modals/SkillsModal'));
const ProjectsModal = lazy(() => import('../components/ui/modals/ProjectsModal'));
const CertificationsModal = lazy(() => import('../components/ui/modals/CertificationsModal'));
const ContactsModal = lazy(() => import('../components/ui/modals/ContactsModal'));

const MODAL_COMPONENTS = {
    aboutMe: AboutMeModal,
    skills: SkillsModal,
    projects: ProjectsModal,
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
