import { memo } from 'react';
import styles from '../ProjectsModal.module.css';
import ProjectCard from './ProjectCard';

const ProjectsGrid = memo(function ProjectsGrid({ projects }) {
    if (projects.length === 0) {
        return (
            <div className={styles['projects-grid']}>
                <div className={styles['no-projects']}>
                    <p>Nessun progetto trovato con i filtri selezionati.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['projects-grid']}>
            {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} isAlternate={index % 2 !== 0} />
            ))}
        </div>
    );
});

export default ProjectsGrid;
