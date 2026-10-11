import { memo } from 'react';
import styles from './ProjectsMessage.module.css';

/**
 * Messaggio di stato della modal Progetti (caricamento, errore, lista vuota, avviso dati non aggiornati).
 * @param {'info'|'error'} variant - aspetto del riquadro
 * @param {string} [role] - es. "status" per annunciare l'avviso agli screen reader
 */
const ProjectsMessage = memo(function ProjectsMessage({ children, variant = 'info', role }) {
    return (
        <div role={role} className={`${styles.message} ${styles[variant] ?? ''}`}>
            {children}
        </div>
    );
});

export default ProjectsMessage;
