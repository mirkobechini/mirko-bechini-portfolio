import { memo, useCallback } from 'react';
import styles from './ProjectCard.module.css';

/**
 * Card di un progetto. Se riceve `onSelect` è cliccabile (e raggiungibile da tastiera) e apre il dettaglio:
 * link, corso, descrizione intera e così via stanno lì, la card resta leggera.
 */
const ProjectCard = memo(function ProjectCard({ project, isAlternate, onSelect }) {
    const open = useCallback(() => onSelect?.(project), [onSelect, project]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
        }
    }, [open]);

    const interactive = typeof onSelect === 'function';

    return (
        <div
            className={`${styles['project-blueprint']} ${isAlternate ? styles.alternate : ''} ${interactive ? styles.clickable : ''}`}
            data-project-id={project.id}
            {...(interactive && {
                role: 'button',
                tabIndex: 0,
                'aria-label': `Apri i dettagli di ${project.title}`,
                onClick: open,
                onKeyDown: handleKeyDown,
            })}
        >
            <div className={styles['blueprint-header']}></div>
            {project.hasCustomPreview && (
                <img
                    className={styles['project-preview']}
                    src={project.preview}
                    alt={`Anteprima di ${project.title}`}
                    loading="lazy"
                    decoding="async"
                    width="320"
                    height="180"
                />
            )}
            <h4 className={styles['project-title']}>{project.title}</h4>
            <p className={styles['project-description']}>{project.description}</p>
            <div className={styles['tech-stack']}>
                {project.technologies.length > 0 ? `#${project.technologies.join(' #')}` : ''}
            </div>
            {interactive && <span className={styles['details-hint']} aria-hidden="true">Apri dettagli ›</span>}
        </div>
    );
});

export default ProjectCard;
