import styles from '../modalsCss/SkillsModal.module.css';
import skillsData from '../../../data/skillsData';
import educationData from '../../../data/educationData';
import { memo } from 'react';

const SkillsModal = memo(function SkillsModal() {
    return (
        <div className={styles.book}>
            <section className={styles.page}>
                <h3>Competenze</h3>
                <div className={styles.skillsList}>
                    {skillsData.map(skill => (
                        <div className={`${styles.skillCard} nes-container is-rounded`} key={skill.id} style={{ color: skill.color }}>
                            <img className={`nes-icon is-medium`} src={skill.icon} alt={skill.skill} />
                        </div>
                    ))}
                </div>
            </section>
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
        </div>
    );
});

export default SkillsModal;