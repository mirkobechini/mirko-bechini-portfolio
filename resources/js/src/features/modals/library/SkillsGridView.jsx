import { memo } from 'react';
import styles from './SkillsModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';

const SkillsGridView = memo(function SkillsGridView({ skillsData, currentSkill, skillCardRefs, onSkillClick, title, onBackToFormation, returnToEducation }) {
    return (
        <section className={styles.page}>
            <h3 className={styles['skills-h3-wrap']}>
                <span>{title}</span>
                {returnToEducation && onBackToFormation && (
                    <button
                        type="button"
                        className={styles['btn-back-formation-page']}
                        onClick={() => onBackToFormation()}
                        aria-label="Torna alla formazione"
                    >
                        ‹ Formazione
                    </button>
                )}
            </h3>
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
                            onClick={() => onSkillClick(skill)}
                            aria-label={`Apri dettagli skill ${skill.skill}`}
                            aria-pressed={currentSkill?.id === skill.id}
                        >
                            <img className="nes-icon is-medium" src={skill.icon} alt={`Icona skill ${skill.skill}`} aria-hidden="true" width="32" height="32" />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
});

export default SkillsGridView;
