import styles from '../modalsCss/SkillsModal.module.css';
import skillsData from '../../../data/skillsData';
import educationData from '../../../data/educationData';
import { memo, useEffect, useRef, useState } from 'react';



const SkillsModal = memo(function SkillsModal() {

    const [currentSkill, setCurrentSkill] = useState(null);
    const skillCardRefs = useRef([]);
    const SKILL_COLUMNS = 4;

    const handleClick = (skill) => {
        setCurrentSkill(skill);
        /*TODO: add page switch sound*/
    };

    useEffect(() => {
        const currentIndex = currentSkill == null
            ? -1
            : skillsData.findIndex((skill) => skill.id === currentSkill.id);

        if (currentIndex >= 0) {
            skillCardRefs.current[currentIndex]?.focus({ preventScroll: true });
        }
    }, [currentSkill]);

    useEffect(() => {
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
    }, [currentSkill]);

    return (
        <div className={styles.book}>
            {currentSkill != null && <span className={styles['btn-home']} onClick={() => handleClick(null)}>Home</span>}
            <section className={styles.page}>
                <h3 style={{ position: 'relative' }}>Competenze </h3>
                <div className={styles['skills-list']}>
                    {skillsData.map((skill, index) => (
                        <button
                            type="button"
                            ref={(el) => {
                                skillCardRefs.current[index] = el;
                            }}
                            className={`${styles['skill-card']} nes-container is-rounded ${currentSkill === skill ? styles['selected-skill'] : ""}`}
                            key={skill.id}
                            style={{ color: skill.color }}
                            onClick={() => handleClick(skill)}
                            aria-label={`Apri dettagli skill ${skill.skill}`}
                            aria-pressed={currentSkill?.id === skill.id}
                        >
                            <img className="nes-icon is-medium" src={skill.icon} alt="" aria-hidden="true" />
                        </button>
                    ))}
                </div>
            </section>
            {currentSkill === null ? (
                <section className={styles.page}>
                    <h3>Formazione</h3>
                    <div className={styles['education-list']}>
                        {educationData.map(education => (
                            <section className={styles['education-card']} key={education.id}>
                                <span className={styles['education-period']}>{education.period}</span>
                                <h5 className={styles['education-title']}>{education.course} - {education.organization}</h5>
                                <p className={styles['education-description']}>{education.description}</p>
                                <div className={styles['education-skills']}>
                                    {education.skills.map((skill, index) => (
                                        <span key={index} className={styles['education-skill']}>{skill}</span>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
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
            )}
        </div>
    );
});

export default SkillsModal;