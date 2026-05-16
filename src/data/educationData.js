const educationData = [
const ASSETS = import.meta.env.VITE_ASSETS_PATH;
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
            certificate: ASSETS + '/modals/certifications/certificato_react_scrimba.png',
                organization: 'Scrimba',
                    organizationUrl: 'https://scrimba.com/learn-react-c0e',
                        period: '09/2015 - 06/2020',
                            skills: ['React'],
    },
{
    id: 3,
        course: 'Certification 3',
            certificate: ASSETS + '/modals/certifications/certificato_react_scrimba.png',
                organization: 'Ente 3',
                    organizationUrl: '#',
                        period: '01/2023 - 06/2023',
                            skills: ['Angular', 'Express', 'MySQL'],
    },
{
    id: 4,
        course: 'Certification 4',
            certificate: ASSETS + '/modals/certifications/certificato_react_scrimba.png',
                organization: 'Ente 4',
                    organizationUrl: '#',
                        period: '01/2022 - 12/2022',
                            skills: ['Vue.js', 'Node.js', 'MongoDB'],
    }
];

export default educationData;
