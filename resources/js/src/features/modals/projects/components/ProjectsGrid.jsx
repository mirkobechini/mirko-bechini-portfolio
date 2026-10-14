import { memo } from 'react';
import styles from './ProjectsGrid.module.css';
import ProjectCard from './ProjectCard';
import ProjectsMessage from './ProjectsMessage';

const ProjectsGrid = memo(function ProjectsGrid({ projects, onSelectProject }) {
    if (projects.length === 0) {
        return (
            <div className={styles['projects-grid']}>
                <ProjectsMessage>
                    <p>Nessun progetto trovato con i filtri selezionati.</p>
                </ProjectsMessage>
            </div>
        );
    }

    return (
        <div className={styles['projects-grid']}>
            {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} isAlternate={index % 2 !== 0} onSelect={onSelectProject} />
            ))}
        </div>
    );
});

export default ProjectsGrid;
