import { memo, useEffect, useRef } from 'react';
import styles from './ProjectDetailView.module.css';
import { isValidLink } from '../../../../utils/links';
import { formatLongDate } from '../../../../utils/formatDate';

const TYPE_LABELS = { frontend: 'Frontend', backend: 'Backend', fullstack: 'Fullstack' };
const SCOPE_LABELS = { personal: 'Personale', work: 'Lavoro' };

/**
 * Dettaglio di un progetto: prende il posto dell'elenco finché non si torna indietro.
 * Mostra ciò che la card non ha spazio per dire: descrizione intera, anteprima grande, stelle, ultimo
 * aggiornamento, corso e link.
 */
const ProjectDetailView = memo(function ProjectDetailView({ project, onBack }) {
    const backRef = useRef(null);

    // Chi naviga da tastiera o con uno screen reader si trova subito sul pulsante per tornare indietro
    useEffect(() => {
        backRef.current?.focus({ preventScroll: true });
    }, []);

    const updated = formatLongDate(project.updatedAt);
    const kind = [TYPE_LABELS[project.type], SCOPE_LABELS[project.projectScope]].filter(Boolean).join(' · ');
    const hasRepo = isValidLink(project.repo);
    const hasLive = isValidLink(project.live);

    return (
        <article className={styles.sheet} aria-labelledby="project-detail-title">
            <button ref={backRef} type="button" className={styles['back-btn']} onClick={onBack}>
                ‹ Torna ai progetti
            </button>

            <h4 id="project-detail-title" className={styles.title}>{project.title}</h4>
            {kind && <p className={styles.kind}>{kind}</p>}

            {project.hasCustomPreview && (
                <img
                    className={styles.preview}
                    src={project.preview}
                    alt={`Anteprima di ${project.title}`}
                    decoding="async"
                    width="960"
                    height="540"
                />
            )}

            {project.description && <p className={styles.description}>{project.description}</p>}

            <dl className={styles.facts}>
                {project.stars > 0 && (
                    <div className={styles.fact}>
                        <dt>Stelle su GitHub</dt>
                        <dd>★ {project.stars}</dd>
                    </div>
                )}
                {updated && (
                    <div className={styles.fact}>
                        <dt>Ultimo aggiornamento</dt>
                        <dd>{updated}</dd>
                    </div>
                )}
                {project.course && (
                    <div className={styles.fact}>
                        <dt>Corso</dt>
                        <dd>{project.course}</dd>
                    </div>
                )}
            </dl>

            {(hasRepo || hasLive) && (
                <div className={styles.links}>
                    {hasRepo && (
                        <a href={project.repo} className={styles['link-btn']} target="_blank" rel="noopener noreferrer">Apri Documentazione</a>
                    )}
                    {hasLive && (
                        <a href={project.live} className={styles['link-btn']} target="_blank" rel="noopener noreferrer">Vai al sito</a>
                    )}
                </div>
            )}
        </article>
    );
});

export default ProjectDetailView;
