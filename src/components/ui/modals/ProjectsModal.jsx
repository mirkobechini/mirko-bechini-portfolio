import styles from '../modalsCss/ProjectsModal.module.css';
import { useMemo, useState } from 'react';
import projectData from '../../../data/projectData';

export default function ProjectsModal() {
    const [currentFolder, setCurrentFolder] = useState(null);

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


    function handleSetCurrentFolder(folder) {
        setCurrentFolder(folder);
    }

    function goBack() {
        setCurrentFolder(null);
    }


    return (
        <div className={styles.deskContainer}>
            <div className={styles.filterContainer}>
                <fieldset className={styles.filterFieldset}>
                    <legend className={styles.filterLabel}>Filtra per tipologia:</legend>
                    <input type='radio' id='frontend' name='filterType' value='frontend' checked={filterType === 'frontend'} onChange={e => setFilterType(e.target.value)} />
                    <label htmlFor='frontend'>Frontend</label>
                    <input type='radio' id='backend' name='filterType' value='backend' checked={filterType === 'backend'} onChange={e => setFilterType(e.target.value)} />
                    <label htmlFor='backend'>Backend</label>
                    <input type='radio' id='fullstack' name='filterType' value='fullstack' checked={filterType === 'fullstack'} onChange={e => setFilterType(e.target.value)} />
                    <label htmlFor='fullstack'>Fullstack</label>
                </fieldset>
                {!currentFolder && (
                    <fieldset className={styles.filterFieldset}>
                        <legend className={styles.filterLabel}>Filtra per azienda:</legend>
                        <input type='radio' id='boolean' name='filterCompany' value='boolean' checked={filterCompany === 'boolean'} onChange={e => setFilterCompany(e.target.value)} />
                        <label htmlFor='boolean'>Boolean</label>
                        <input type='radio' id='personal' name='filterCompany' value='personal' checked={filterCompany === 'personal'} onChange={e => setFilterCompany(e.target.value)} />
                        <label htmlFor='personal'>Personali</label>
                    </fieldset>
                )}
                <button onClick={() => { setFilterType(null); setFilterCompany(null); }}>Reset Filters</button>
            </div>
            {!currentFolder ? (
                <>

                    <div className={styles.foldersGrid}>
                        {Object.keys(groupedProjects).map(company => (
                            <div className={styles.folder} onClick={() => handleSetCurrentFolder(company)} key={company}>
                                <div className={styles.folderIcon}>📂</div> {/* Icona cartella generica, sostituire con icona? */}
                                <span>{company}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.projectsView}>
                    <button className={styles.backBtn} onClick={goBack}>⬅ Torna alla Scrivania</button>
                    <div className={styles.projectsGrid}>
                        {filteredProjects.filter(project => project.company === currentFolder).map((project, index) => (

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
            )}
        </div>
    );
}