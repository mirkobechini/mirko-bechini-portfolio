import { getAssetPath } from '../utils/assets';

const educationData = [
    {
        id: 1,
        course: 'Web development part-time specializzazione PHP e Laravel',
        description: "Corso online ...",
        certificate: 'https://cdn.certifier.io/fa42c19f-1139-4574-ac7a-83b13341a48e/credentials/01kjpz4adz63kdjmb8dvkkvqkp/designs/01kecgnrmxpmnwpapcy6fqm34w/EaIJLLzwYX.png',
        organization: 'Boolean',
        organizationUrl: 'https://boolean.careers',
        period: '05/2025 - 02/2026',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MySQL', 'PHP', 'Laravel'], //tecnologie categorizzate in frontend e backend ed hanno codice colore
    },
    {
        id: 2,
        course: 'LEARN REACT',
        certificate: getAssetPath('/modals/certifications/certificato-react-scrimba.webp'),
        organization: 'Scrimba',
        organizationUrl: 'https://scrimba.com/learn-react-c0e',
        period: '03/2026 - 03/2026',
        skills: ['React'],
    },
    {
        id: 3,
        course: 'LEARN TYPESCRIPT',
        certificate: getAssetPath('/modals/certifications/certificato-typescript-scrimba.webp'),
        organization: 'Scrimba',
        organizationUrl: 'https://scrimba.com/learn-typescript',
        period: '03/2026 - current',
        skills: ['TypeScript'],
    },
];

export default educationData;
