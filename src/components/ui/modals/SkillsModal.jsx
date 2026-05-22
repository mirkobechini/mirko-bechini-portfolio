import styles from '../modalsCss/SkillsModal.module.css';
import skillsData from '../../../data/skillsData';
import educationData from '../../../data/educationData';
import { memo, useState } from 'react';



const SkillsModal = memo(function SkillsModal() {

    const [currentSkill, setCurrentSkill] = useState(null);

    const handleClick = (skill) => {
        setCurrentSkill(skill);
        /*TODO: add page switch sound*/
    };

    return (
        <div className={styles.book}>
            {currentSkill != null && <span className={styles['btn-home']} onClick={() => handleClick(null)}>Home</span>}
            <section className={styles.page}>
                <h3 style={{ position: 'relative' }}>Competenze </h3>
                <div className={styles['skills-list']}>
                    {skillsData.map(skill => (
                        <button
                            type="button"
                            className={`${styles['skill-card']} nes-container is-rounded ${currentSkill === skill ? styles['selected-skill'] : ""}`}
                            key={skill.id}
                            style={{ color: skill.color }}
                            onClick={() => handleClick(skill)}
                            aria-label={`Apri dettagli skill ${skill.skill}`}
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