import styles from '../modalsCss/ProjectsModal.module.css';
import { useMemo, useState, memo } from 'react';
import projectData from '../../../data/projectData';
const frontendIcon = '/assets/images/projectModal/frontend-icon.png';
const backendIcon = '/assets/images/projectModal/backend-icon.png';
const fullstackIcon = '/assets/images/projectModal/fullstack-icon.png';
const folderIcon = '/assets/images/projectModal/folder-icon.png';
const resetButtonIcon = '/assets/images/projectModal/reset_button.png';

const ProjectsModal = memo(function ProjectsModal() {

    const [filterType, setFilterType] = useState(null);
    const [filterCompany, setFilterCompany] = useState(null);


    const filteredProjects = useMemo(() => {
        return projectData.filter(project => {
            if (filterType && project.type !== filterType) {
                return false;
            }
            if (filterCompany && project.company !== filterCompany) {
                return false;
            }
            return true;
        });
    }, [filterType, filterCompany]);

    const groupedProjects = useMemo(() => {
        return filteredProjects.reduce((companies, project) => {
            if (!companies[project.company]) {
                companies[project.company] = [];
            }
            companies[project.company].push(project);
            return companies;
        }, {});
    }, [filteredProjects]);


    return (
        <div className={styles['desk-container']}>
            {/*TODO: filter container hidden?*/}
            <div className={styles['filter-container']}>
                <div className={styles['filter-group']}>
                    <fieldset className={styles['filter-wrapper']}>
                        <input type='radio' className={styles['visually-hidden']} id='frontend' name='filterType' value='frontend' checked={filterType === 'frontend'} onChange={e => setFilterType(e.target.value)} />
                        <label htmlFor='frontend' className={`${styles['button-label']} ${filterType === 'frontend' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={frontendIcon} alt="Frontend" /> Frontend</label>
                        <input type='radio' className={styles['visually-hidden']} id='backend' name='filterType' value='backend' checked={filterType === 'backend'} onChange={e => setFilterType(e.target.value)} />
                        <label htmlFor='backend' className={`${styles['button-label']} ${filterType === 'backend' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={backendIcon} alt="Backend" /> Backend</label>
                        <input type='radio' className={styles['visually-hidden']} id='fullstack' name='filterType' value='fullstack' checked={filterType === 'fullstack'} onChange={e => setFilterType(e.target.value)} />
                        <label htmlFor='fullstack' className={`${styles['button-label']} ${filterType === 'fullstack' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={fullstackIcon} alt="Fullstack" /> Fullstack</label>
                    </fieldset>
                    <fieldset className={styles['filter-wrapper']}>
                        <input type='radio' className={styles['visually-hidden']} id='boolean' name='filterCompany' value='boolean' checked={filterCompany === 'boolean'} onChange={e => setFilterCompany(e.target.value)} />
                        <label htmlFor='boolean' className={`${styles['button-label']} ${filterCompany === 'boolean' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={folderIcon} alt="Boolean" /> Boolean</label>
                        <input type='radio' className={styles['visually-hidden']} id='personal' name='filterCompany' value='personal' checked={filterCompany === 'personal'} onChange={e => setFilterCompany(e.target.value)} />
                        <label htmlFor='personal' className={`${styles['button-label']} ${filterCompany === 'personal' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={folderIcon} alt="Personali" /> Personali</label>
                    </fieldset>
                </div>
                <button className={styles['reset-button-container']} onClick={() => { setFilterType(null); setFilterCompany(null); }} type="button">
                    <img src={resetButtonIcon} alt="Reset Filters" />
                    <span className={styles['reset-text']}>Reset Filter</span>
                </button>
            </div>
            <div className={styles['projects-view']}>
                <div className={styles['projects-grid']}>
                    {filteredProjects.map((project, index) => (

                        <div className={`${styles['project-blueprint']} ${index % 2 === 0 ? "" : styles.alternate}`} key={project.id}>
                            <div className={styles['blueprint-header']}></div>
                            <h4 className={styles['project-title']}>{project.title}</h4>
                            <p>{project.description}</p>
                            <div className={styles['tech-stack']}>{project.technologies.map(tech => `#${tech} `)}</div>
                            <div className={styles['links-group']}>
                                {project.repo !== "#" && <a href={project.repo} className={styles['view-btn']}>Apri Documentazione</a>}
                                {project.demo !== "#" && <a href={project.demo} className={styles['view-btn']}>Vai al sito</a>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default ProjectsModal;