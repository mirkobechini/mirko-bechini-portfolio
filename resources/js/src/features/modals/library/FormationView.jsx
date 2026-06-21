import { memo, useEffect, useState } from 'react';
import styles from './SkillsModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';

const STATUS_LABELS = {
    onHold: 'In sospeso',
    inProgress: 'In corso',
    next: 'Prossimo',
};

const FormationView = memo(function FormationView({ currentProfile, educationData, formationFocus, formationRoadmap }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <section className={`${styles.page} ${styles['education-page']}`}>
                <h3>{currentProfile.title}</h3>
                <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`}>
                    {/*TODO: trasformare in link che apre il percorso formativo in una pagina dedicata con ulteriore link a certificazione*/}
                    {educationData.map((education) => (
                        <section className={styles['education-card']} key={education.id}>
                            <span className={styles['education-period']}>{education.period}</span>
                            <h5 className={styles['education-title']}>{education.course} - {education.organization}</h5>
                            <p className={styles['education-description']}>{education.description}</p>
                            <div className={styles['education-skills']}>
                                {(education.skills ?? []).map((skill, index) => (
                                    <span key={index} className={styles['education-skill']}>{skill}</span>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </section>
            <section className={styles.page}>
                <h3>{currentProfile.detailsTitle ?? 'Percorso e prossimi step'}</h3>
                <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`}>
                    <section className={styles['formation-panel']}>
                        <h4>Focus attuale</h4>
                        <div className={styles['formation-cards']}>
                            {formationFocus.map((item, index) => (
                                <article key={`focus-${index}`} className={styles['education-card']}>
                                    <header className={styles['formation-card-header']}>
                                        <h5>{item.title}</h5>
                                        {!isMobile && (
                                            <span className={`${styles['formation-status']} ${styles[`status-${item.status}`]}`}>
                                                {STATUS_LABELS[item.status] ?? 'Info'}
                                            </span>
                                        )}
                                    </header>
                                    <p>{item.description}</p>
                                    {item.badge && <span className={styles['formation-badge']}>{item.badge}</span>}
                                </article>
                            ))}
                        </div>
                    </section>

                    {/*TODO: add formation page with related projects*/}
                    <section className={styles['formation-panel']}>
                        <h4>Roadmap</h4>
                        <div className={styles['formation-cards']}>
                            {formationRoadmap.map((item, index) => (
                                <article key={`roadmap-${index}`} className={styles['education-card']}>
                                    <header className={styles['formation-card-header']}>
                                        <h5>{item.title}</h5>
                                        {!isMobile && (
                                            <span className={`${styles['formation-status']} ${styles[`status-${item.status}`]}`}>
                                                {STATUS_LABELS[item.status] ?? 'Info'}
                                            </span>
                                        )}
                                    </header>
                                    <p>{item.description}</p>
                                    {item.badge && <span className={styles['formation-badge']}>{item.badge}</span>}
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
});

export default FormationView;