import { memo } from 'react';
import styles from '../ProjectsModal.module.css';
import { isValidLink } from '../../../../utils/links';

const ProjectCard = memo(function ProjectCard({ project, isAlternate }) {
    return (
        <div className={`${styles['project-blueprint']} ${isAlternate ? styles.alternate : ''}`}>
            <div className={styles['blueprint-header']}></div>
            <h4 className={styles['project-title']}>{project.title}</h4>
            <p className={styles['project-description']} title={project.description}>{project.description}</p>
            <div className={styles['tech-stack']}>
                {project.technologies.length > 0 ? `#${project.technologies.join(' #')}` : ''}
            </div>
            <div className={styles['links-group']}>
                {isValidLink(project.repo) && (
                    <a href={project.repo} className={styles['view-btn']} target="_blank" rel="noopener noreferrer">Apri Documentazione</a>
                )}
                {isValidLink(project.live) && (
                    <a href={project.live} className={styles['view-btn']} target="_blank" rel="noopener noreferrer">Vai al sito</a>
                )}
            </div>
        </div>
    );
});

export default ProjectCard;
