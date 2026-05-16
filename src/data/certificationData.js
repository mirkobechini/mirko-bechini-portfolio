import { getAssetPath } from '../utils/assets';

const certificationData = [
    {
        id: 1,
        title: 'Master web development part-time specializzazione PHP e Laravel',
        preview: 'https://cdn.certifier.io/fa42c19f-1139-4574-ac7a-83b13341a48e/credentials/01kjpz4adz63kdjmb8dvkkvqkp/designs/01kecgnrmxpmnwpapcy6fqm34w/EaIJLLzwYX.png',
        link: 'https://credsverse.com/credentials/2d889fb2-6f2f-4d35-9b2a-1f408277f652',
        organization: 'Boolean',
        organizationUrl: 'https://boolean.careers',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MySQL', 'PHP', 'Laravel'], //tecnologie categorizzate in frontend e backend ed hanno codice colore
    },
    {
        id: 2,
        title: 'Certificato di completamento corso LEARN REACT',
        preview: getAssetPath('/modals/certifications/certificato_react_scrimba.png'),
        link: null,
        organization: 'Scrimba',
        organizationUrl: 'https://scrimba.com/learn-react-c0e',
        skills: ['React'],
    },
    {
        id: 3,
        title: 'Certification 3',
        preview: getAssetPath('/modals/certifications/certificato_react_scrimba.png'),
        link: '#',
        organization: 'Ente 3',
        organizationUrl: '#',
        skills: ['Angular', 'Express', 'MySQL'],
    }
];

export default certificationData;
