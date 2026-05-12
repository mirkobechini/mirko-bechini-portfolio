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
            <section className={styles.page}>
                <h3 style={{ position: 'relative' }}>Competenze {currentSkill != null && <span className={styles.btnHome} onClick={() => handleClick(null)}>home</span>}</h3>
                <div className={styles.skillsList}>
                    {skillsData.map(skill => (
                        <div className={`${styles.skillCard} nes-container is-rounded ${currentSkill === skill ? "is-dark" : ""}`} key={skill.id} style={{ color: skill.color }}>
                            <img className={`nes-icon is-medium`} src={skill.icon} alt={skill.skill} onClick={() => handleClick(skill)} />
                        </div>
                    ))}
                </div>
            </section>
            {currentSkill === null ? (
                <section className={styles.page}>
                    <h3>Formazione</h3>
                    <div className={styles.educationList}>
                        {educationData.map(education => (
                            <section className={styles.educationCard} key={education.id}>
                                <span className={styles.educationPeriod}>{education.period}</span>
                                <h5 className={styles.educationTitle}>{education.course} - {education.organization}</h5>
                                <p className={styles.educationDescription}>{education.description}</p>
                                <div className={styles.educationSkills}>
                                    {education.skills.map((skill, index) => (
                                        <span key={index} className={styles.educationSkill}>{skill}</span>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </section>
            ) : (
                <section className={`${styles.page} ${styles.skillPage}`}>
                    <h3>{currentSkill.skill}</h3>
                    <p>{currentSkill.description}</p>
                    <section className={styles.functionality}>
                        <h4>Funzionalita conosciute:</h4>
                        <ul>
                            funzionalita da inserire
                        </ul>
                    </section>
                    <section className={styles.relatedProjects}>
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