import styles from '../modalsCss/ProjectsModal.module.css';
import { useEffect, useState } from 'react';
import projectData from '../../../data/projectData';

export default function ProjectsModal() {
    const [currentFolder, setCurrentFolder] = useState(null);
    const [groupedProjects, setGroupedProjects] = useState({});

    useEffect(() => {
        const grouped = projectData.reduce((customers, project) => {
            if (!customers[project.customer]) {
                customers[project.customer] = [];
            }
            customers[project.customer].push(project);
            return customers;
        }, {});
        setGroupedProjects(grouped);
    }, [currentFolder]);


    function handleSetCurrentFolder(folder) {
        setCurrentFolder(folder);
    }

    function goBack() {
        setCurrentFolder(null);
    }


    return (
        <div className={styles.deskContainer}>
            {!currentFolder ? (
                //TODO: Inserire dei label? in alto per filtrare i progetti (frontend,backend,fullstack), (aziende), (personali)
                <div className={styles.foldersGrid}>
                    {Object.keys(groupedProjects).map(customer => (                        
                        <div className={styles.folder} onClick={() => handleSetCurrentFolder(customer)}>
                            <div className={styles.folderIcon}>📂</div> {/* Icona cartella generica, sostituire con icona? */}
                            <span>{customer}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.projectsView}>
                    <button className={styles.backBtn} onClick={goBack}>⬅ Torna alla Scrivania</button>
                    <div className={styles.projectsGrid}>
                        {projectData.filter(project => project.customer === currentFolder).map((project, index) => (

                            <div className={`${styles.projectBlueprint} ${index % 2 === 0 ? "" : styles.alternate}`} key={project.id}>
                                <div className={styles.blueprintHeader}></div>
                                <h4>{project.title}</h4>
                                <p>{project.description}</p>
                                <div className={styles.techStack}>{project.technologies.map(tech => `#${tech} `)}</div>

                                <a href={project.repo} className={styles.viewBtn}>Apri Documentazione</a>
                                <a href={project.demo} className={styles.viewBtn}>Vai al sito</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}