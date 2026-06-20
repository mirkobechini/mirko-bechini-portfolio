import aboutModalConfig from './about/aboutModalConfig';
import libraryModalConfig from './library/libraryModalConfig';
import projectsModalConfig from './projects/projectsModalConfig';
import certificationsModalConfig from './certifications/certificationsModalConfig';
import contactsModalConfig from './contacts/contactsModalConfig';

// Esportiamo solo la configurazione pura (senza componenti logici dentro)
const MODAL_DATA = [
    aboutModalConfig,
    libraryModalConfig,
    projectsModalConfig,
    certificationsModalConfig,
    contactsModalConfig,
];

export default MODAL_DATA;