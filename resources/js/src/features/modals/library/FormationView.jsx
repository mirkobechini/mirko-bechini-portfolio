import { memo, useCallback, useEffect, useState } from 'react';
import styles from './SkillsModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';
import FormationDetailView from './FormationDetailView';
import playBookFlip from '../../../utils/playBookFlip';

const STATUS_LABELS = {
    onHold: 'In sospeso',
    inProgress: 'In corso',
    next: 'Prossimo',
};

const FormationView = memo(function FormationView({ currentProfile, educationData, formationFocus, formationRoadmap, onSwitchToSkill, returnToEducation }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedEducation, setSelectedEducation] = useState(null);

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /* Auto-open detail when returning from skills */
    useEffect(() => {
        if (returnToEducation) {
            setSelectedEducation(returnToEducation);
        }
    }, [returnToEducation]);

    const handleEducationClick = useCallback((education) => {
        setSelectedEducation(education);
        playBookFlip();
    }, []);

    const handleDetailBack = useCallback(() => {
        setSelectedEducation(null);
        playBookFlip();
    }, []);

    const handleKeyDown = useCallback((e, education) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedEducation(education);
        }
    }, []);

    /* ── Detail view (both pages) ── */
    if (selectedEducation) {
        return (
            <>
                <section className={styles.page}>
                    <h3 className={styles['detail-h3']}>
                        <button
                            type="button"
                            className={styles['detail-back-inline']}
                            onClick={handleDetailBack}
                            aria-label="Torna alla visione d'insieme"
                        >
                            <span aria-hidden="true">‹</span> Formazione
                        </button>
                        <span className={styles['detail-h3-title']}>{selectedEducation.course}</span>
                    </h3>
                    <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`}>
                        <FormationDetailView
                            education={selectedEducation}
                            page={1}
                            onSkillTagClick={onSwitchToSkill}
                        />
                    </div>
                </section>
                <section className={styles.page}>
                    <h3 className={styles['detail-h3-title-only']}>{selectedEducation.course}</h3>
                    <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`}>
                        <FormationDetailView
                            education={selectedEducation}
                            page={2}
                            onSkillTagClick={onSwitchToSkill}
                        />
                    </div>
                </section>
            </>
        );
    }

    /* ── Overview (list of education cards) ── */
    return (
        <>
            <section className={`${styles.page} ${styles['education-page']}`}>
                <h3>{currentProfile.title}</h3>
                <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`}>
                    {educationData.map((education) => (
                        <section
                            className={styles['education-card']}
                            key={education.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Dettagli formazione: ${education.course}`}
                            onClick={() => handleEducationClick(education)}
                            onKeyDown={(e) => handleKeyDown(e, education)}
                            style={{ cursor: 'var(--cursor-nes-pointer)' }}
                        >
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