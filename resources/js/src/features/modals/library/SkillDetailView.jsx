import { memo } from 'react';
import styles from './SkillsModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';

const SkillDetailView = memo(function SkillDetailView({ currentSkill, detailsTitle }) {
    if (!currentSkill) {
        return (
            <section className={styles.page}>
                <h3>{detailsTitle ?? 'Dettagli skill'}</h3>
                <p>Seleziona una skill per visualizzare dettagli e contenuti correlati.</p>
                <p>Utilizza ← ↑ → ↓ per selezionare/cambiare skill.</p>
            </section>
        );
    }

    return (
        <section className={`${styles.page} ${styles['skills-page']}`}>
            <h3>{currentSkill.skill}</h3>
            <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`}>
                <section className={styles.functionality}>
                    <h4>Funzionalita conosciute:</h4>
                    <ul className={styles['functionality-list']}>
                        {currentSkill.functions?.map((func, index) => (
                            <li key={index} className={styles['functionality-item']}>{func}</li>
                        )) ?? <li className={styles['functionality-item']}>Funzionalità da inserire</li>}
                    </ul>
                </section>
                <section className={styles['related-projects']}>
                    <h4>Progetti correlati:</h4>
                    <ul className={styles['related-projects-list']}>
                        {currentSkill.relatedProjects?.map((project, index) => (
                            <li key={index} className={styles['related-projects-item']}>{project}</li>
                        )) ?? <li className={styles['related-projects-item']}>Progetti da inserire</li>}
                    </ul>
                </section>
            </div>
        </section>
    );
});

export default SkillDetailView;