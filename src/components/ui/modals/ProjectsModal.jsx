import styles from '../modalsCss/ProjectsModal.module.css';
import { useMemo, useState } from 'react';
import projectData from '../../../data/projectData';

const resetButtonIcon = '/assets/images/projectModal/reset_button.png';

export default function ProjectsModal() {

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
        <div className={styles.deskContainer}>
            <div className={styles.filterContainer}>
                <fieldset className={styles.filterWrapper}>
                    <span className={styles.filterLabel}>Filtra per tipologia:</span>
                    <input type='radio' className={styles.visuallyHidden} id='frontend' name='filterType' value='frontend' checked={filterType === 'frontend'} onChange={e => setFilterType(e.target.value)} />
                    <label htmlFor='frontend' className={styles.buttonLabel + ' ' + (filterType === 'frontend' ? styles.selectedFilter : '')}>Frontend</label>
                    <input type='radio' className={styles.visuallyHidden} id='backend' name='filterType' value='backend' checked={filterType === 'backend'} onChange={e => setFilterType(e.target.value)} />
                    <label htmlFor='backend' className={styles.buttonLabel + ' ' + (filterType === 'backend' ? styles.selectedFilter : '')}> Backend</label>
                    <input type='radio' className={styles.visuallyHidden} id='fullstack' name='filterType' value='fullstack' checked={filterType === 'fullstack'} onChange={e => setFilterType(e.target.value)} />
                    <label htmlFor='fullstack' className={styles.buttonLabel + ' ' + (filterType === 'fullstack' ? styles.selectedFilter : '')}>Fullstack</label>
                </fieldset>
                <fieldset className={styles.filterWrapper}>
                    <span className={styles.filterLabel}>Filtra per azienda:</span>
                    <input type='radio' className={styles.visuallyHidden} id='boolean' name='filterCompany' value='boolean' checked={filterCompany === 'boolean'} onChange={e => setFilterCompany(e.target.value)} />
                    <label htmlFor='boolean' className={styles.buttonLabel + ' ' + (filterCompany === 'boolean' ? styles.selectedFilter : '')}>Boolean</label>
                    <input type='radio' className={styles.visuallyHidden} id='personal' name='filterCompany' value='personal' checked={filterCompany === 'personal'} onChange={e => setFilterCompany(e.target.value)} />
                    <label htmlFor='personal' className={styles.buttonLabel + ' ' + (filterCompany === 'personal' ? styles.selectedFilter : '')}>Personali</label>
                </fieldset>
                <button className={styles.resetButtonContainer} onClick={() => { setFilterType(null); setFilterCompany(null); }} type="button">
                    <img src={resetButtonIcon} alt="Reset Filters" />
                    <span className={styles.resetText}>Reset Filter</span>
                </button>
            </div>
            <div className={styles.projectsView}>
                <div className={styles.projectsGrid}>
                    {filteredProjects.map((project, index) => (

                        <div className={`${styles.projectBlueprint} ${index % 2 === 0 ? "" : styles.alternate}`} key={project.id}>
                            <div className={styles.blueprintHeader}></div>
                            <h4 className={styles.projectTitle}>{project.title}</h4>
                            <p>{project.description}</p>
                            <div className={styles.techStack}>{project.technologies.map(tech => `#${tech} `)}</div>
                            <div className={styles.linksGroup}>
                                {project.repo !== "#" && <a href={project.repo} className={styles.viewBtn}>Apri Documentazione</a>}
                                {project.demo !== "#" && <a href={project.demo} className={styles.viewBtn}>Vai al sito</a>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}