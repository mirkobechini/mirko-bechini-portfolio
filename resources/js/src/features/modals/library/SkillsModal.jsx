import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './SkillsModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';
import defaultSkillsData from './skillsData';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';

const SKILL_COLUMNS = 4;

const SkillsModal = memo(function SkillsModal({ profile, onBackToBookshelf }) {
    const currentProfile = profile ?? {
        id: 'skills',
        title: 'Competenze',
        enableKeyboardNavigation: true,
        skillsData: defaultSkillsData,
    };

    const skillsData = useMemo(() => currentProfile.skillsData ?? [], [currentProfile.skillsData]);
    const educationData = currentProfile.educationData ?? [];
    const formationFocus = currentProfile.formationFocus ?? [];
    const formationRoadmap = currentProfile.formationRoadmap ?? [];
    const isSkillsProfile = currentProfile.id === 'skills';
    const isFormationProfile = currentProfile.id === 'formation';
    const profileVariantClass = isFormationProfile ? styles['book-formation'] : styles['book-skills'];

    const [currentSkill, setCurrentSkill] = useState(null);
    const skillCardRefs = useRef([]);

    const statusLabels = {
        onHold: 'In sospeso',
        inProgress: 'In corso',
        next: 'Prossimo',
    };

    const handleSkillClick = (skill) => {
        setCurrentSkill(skill);
    };

    const handleHomeClick = () => {
        onBackToBookshelf?.();
    };

    useEffect(() => {
        if (currentSkill == null) return;

        const currentIndex = skillsData.findIndex((skill) => skill.id === currentSkill.id);
        const activeCard = skillCardRefs.current[currentIndex];

        // Forziamo il focus hardware solo se il browser non ha già il focus lì sopra
        if (currentIndex >= 0 && document.activeElement !== activeCard) {
            activeCard?.focus({ preventScroll: true });
        }
    }, [currentSkill, skillsData]);

    const currentSkillIndex = currentSkill == null
        ? -1
        : skillsData.findIndex((skill) => skill.id === currentSkill.id);

    const handleSkillNavigate = useCallback((nextIndex) => {
        setCurrentSkill(skillsData[nextIndex]);
    }, [skillsData]);

    useKeyboardNavigation({
        currentIndex: currentSkillIndex,
        onNavigate: handleSkillNavigate,
        totalItems: skillsData.length,
        mode: 'grid',
        columns: SKILL_COLUMNS,
        enabled: currentProfile.enableKeyboardNavigation && isSkillsProfile && skillsData.length > 0,
    });


    {/*Responsive smartphone */ }
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Determine if the device is mobile

    const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        setIsMobile(isMobile);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={`${styles.book} ${profileVariantClass}`} data-profile={currentProfile.id}>
            {onBackToBookshelf && (
                <button type="button" className={styles['btn-home']} onClick={handleHomeClick} aria-label="Torna alla libreria">
                    Home
                </button>
            )}

            {isSkillsProfile && (
                <section className={styles.page}>
                    <h3>{currentProfile.title}</h3>
                    <div className={`${styles['page-content']} ${sharedStyles['scroll-y-contain']}`} style={{ paddingRight: 0 }}>
                        <div className={`${styles['skills-list']} ${sharedStyles['scroll-y-contain']}`}>
                            {skillsData.map((skill, index) => (
                                <button
                                    type="button"
                                    ref={(el) => {
                                        skillCardRefs.current[index] = el;
                                    }}
                                    className={`${styles['skill-card']} nes-container is-rounded ${currentSkill === skill ? styles['selected-skill'] : ''}`}
                                    key={skill.id}
                                    style={{ color: skill.color }}
                                    onClick={() => handleSkillClick(skill)}
                                    aria-label={`Apri dettagli skill ${skill.skill}`}
                                    aria-pressed={currentSkill?.id === skill.id}
                                >
                                    <img className="nes-icon is-medium" src={skill.icon} alt={`Icona skill ${skill.skill}`} aria-hidden="true" width="32" height="32" />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {isSkillsProfile && (currentSkill === null ? (
                <section className={styles.page}>
                    <h3>{currentProfile.detailsTitle ?? 'Dettagli skill'}</h3>
                    <p>Seleziona una skill per visualizzare dettagli e contenuti correlati.</p>
                    <p>Utilizza ← ↑ → ↓ per selezionare/cambiare skill.</p>
                </section>
            ) : (
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
                            {/*TODO: trasformare in link che apre il progetto in un modal dedicato*/}
                            <ul className={styles['related-projects-list']}>
                                {currentSkill.relatedProjects?.map((project, index) => (
                                    <li key={index} className={styles['related-projects-item']}>{project}</li>
                                )) ?? <li className={styles['related-projects-item']}>Progetti da inserire</li>}
                            </ul>
                        </section>
                    </div>
                </section>
            ))}

            {isFormationProfile && (
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
                                                {!isMobile && <span className={`${styles['formation-status']} ${styles[`status-${item.status}`]}`}>
                                                    {statusLabels[item.status] ?? 'Info'}
                                                </span>}
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
                                                {!isMobile && <span className={`${styles['formation-status']} ${styles[`status-${item.status}`]}`}>
                                                    {statusLabels[item.status] ?? 'Info'}
                                                </span>}
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
            )}

            {!isSkillsProfile && !isFormationProfile && (
                <section className={styles.page}>
                    <h3>Profilo non disponibile</h3>
                </section>
            )}
        </div>
    );
});

export default SkillsModal;
