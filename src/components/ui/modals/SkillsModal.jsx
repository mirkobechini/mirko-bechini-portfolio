import { memo, useEffect, useMemo, useRef, useState } from 'react';
import styles from '../modalsCss/SkillsModal.module.css';
import defaultSkillsData from '../../../data/skillsData';

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
        done: 'Completato',
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
        const currentIndex = currentSkill == null
            ? -1
            : skillsData.findIndex((skill) => skill.id === currentSkill.id);

        if (currentIndex >= 0) {
            skillCardRefs.current[currentIndex]?.focus({ preventScroll: true });
        }
    }, [currentSkill, skillsData]);

    useEffect(() => {
        if (!currentProfile.enableKeyboardNavigation || !isSkillsProfile || skillsData.length === 0) {
            return;
        }

        function getNextIndex(currentIndex, key) {
            const totalSkills = skillsData.length;

            if (totalSkills === 0) return -1;
            if (currentIndex < 0) {
                return key === 'ArrowLeft' || key === 'ArrowUp' ? totalSkills - 1 : 0;
            }

            switch (key) {
                case 'ArrowRight':
                    return (currentIndex + 1) % totalSkills;
                case 'ArrowLeft':
                    return (currentIndex - 1 + totalSkills) % totalSkills;
                case 'ArrowDown': {
                    const rowJump = currentIndex + SKILL_COLUMNS;
                    if (rowJump < totalSkills) return rowJump;

                    const sameColumnFirstRow = currentIndex % SKILL_COLUMNS;
                    return sameColumnFirstRow < totalSkills ? sameColumnFirstRow : totalSkills - 1;
                }
                case 'ArrowUp': {
                    const rowJump = currentIndex - SKILL_COLUMNS;
                    if (rowJump >= 0) return rowJump;

                    const currentColumn = currentIndex % SKILL_COLUMNS;
                    const lastIndexInColumn = totalSkills - 1 - ((totalSkills - 1 - currentColumn) % SKILL_COLUMNS);
                    return lastIndexInColumn;
                }
                default:
                    return currentIndex;
            }
        }

        function handleKeyDown(event) {
            const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (!arrowKeys.includes(event.key)) return;

            const activeEl = document.activeElement;
            const isTypingTarget = activeEl?.tagName === 'INPUT'
                || activeEl?.tagName === 'TEXTAREA'
                || activeEl?.tagName === 'SELECT'
                || activeEl?.isContentEditable;

            if (isTypingTarget) return;

            event.preventDefault();

            const currentIndex = currentSkill == null
                ? -1
                : skillsData.findIndex((skill) => skill.id === currentSkill.id);
            const nextIndex = getNextIndex(currentIndex, event.key);

            if (nextIndex >= 0) {
                setCurrentSkill(skillsData[nextIndex]);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentSkill, currentProfile.enableKeyboardNavigation, isSkillsProfile, skillsData]);

    return (
        <div className={`${styles.book} ${profileVariantClass}`} data-profile={currentProfile.id}>
            {onBackToBookshelf && (
                <button type="button" className={styles['btn-home']} onClick={handleHomeClick} aria-label="Torna alla libreria">
                    Home
                </button>
            )}

            {isSkillsProfile && (
                <section className={styles.page}>
                    <h3 style={{ position: 'relative' }}>{currentProfile.title}</h3>
                    <div className={styles['skills-list']}>
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
                                <img className="nes-icon is-medium" src={skill.icon} alt="" aria-hidden="true" />
                            </button>
                        ))}
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
                    <p>{currentSkill.description}</p>
                    <section className={styles.functionality}>
                        <h4>Funzionalita conosciute:</h4>
                        <ul>
                            funzionalita da inserire
                        </ul>
                    </section>
                    <section className={styles['related-projects']}>
                        <h4>Progetti correlati:</h4>
                        <ul>
                            progetti correlati da inserire
                        </ul>
                    </section>
                </section>
            ))}

            {isFormationProfile && (
                <>
                    <section className={`${styles.page} ${styles['education-page']}`}>
                        <h3>{currentProfile.title}</h3>
                        <div className={styles['education-list']}>
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
                    <section className={`${styles.page} ${styles['formation-page']}`}>
                        <h3>{currentProfile.detailsTitle ?? 'Percorso e prossimi step'}</h3>
                        <div className={styles['future-steps']}>
                            <section className={styles['formation-panel']}>
                                <h4>Focus attuale</h4>
                                <div className={styles['formation-cards']}>
                                    {formationFocus.map((item, index) => (
                                        <article key={`focus-${index}`} className={styles['formation-card']}>
                                            <header className={styles['formation-card-header']}>
                                                <h5>{item.title}</h5>
                                                <span className={`${styles['formation-status']} ${styles[`status-${item.status}`]}`}>
                                                    {statusLabels[item.status] ?? 'Info'}
                                                </span>
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
                                        <article key={`roadmap-${index}`} className={styles['formation-card']}>
                                            <header className={styles['formation-card-header']}>
                                                <h5>{item.title}</h5>
                                                <span className={`${styles['formation-status']} ${styles[`status-${item.status}`]}`}>
                                                    {statusLabels[item.status] ?? 'Info'}
                                                </span>
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
