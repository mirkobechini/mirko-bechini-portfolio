import { memo } from 'react';
import styles from '../modalsCss/AboutMeModal.module.css';

const AboutMeModal = memo(function AboutMeModal() {
    return (
        <>
            <h3 style={{ marginBottom: '1rem' }}>Ciao sono Mirko</h3>
            <p style={{ marginBottom: '1rem' }}>Un sviluppatore web che ha arricchito le proprie competenze in Informatica,
                acquisite alle scuole superiori, conseguendo un Master in Web Development.</p>
            <p style={{ marginBottom: '1rem' }}>
                Le esperienze passate mi hanno permesso di acquisire importanti soft skills,
                come la capacità di lavorare in team, la gestione del tempo e la risoluzione di problemi
                in contesti critici.
            </p>
            <p style={{ marginBottom: '1rem' }}>
                Oltre alla programmazione sono appassionato al mondo dei videogiochi,
                da cui ho preso ispirazione per la realizzazione di questo portfolio.
            </p>
            <p style={{ marginBottom: '1rem' }}>

                Mi piace leggere i manga, guardare gli anime e allenarmi in palestra, tutte attività
                che mi aiutano ad affrontare le sfide quotidiane con grinta e perseveranza.
            </p>
            <img src="/assets/modals/about-me/bottom-sprite.png" alt="bottom sprite" className={styles['bottom-sprite']} />
        </>
    );
});

export default AboutMeModal;