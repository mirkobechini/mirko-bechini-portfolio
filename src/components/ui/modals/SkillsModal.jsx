import styles from '../modalsCss/SkillsModal.module.css';
import skillsData from '../../../data/skillsData';

export default function SkillsModal() {
    return (
        <div className={styles.book}>
            <section className={styles.page}>
                <h3>Competenze</h3>
                <div className={styles.skillsList}>
                    {skillsData.map(skill => (
                        <div className={`${styles.skillContainer} nes-container is-rounded is-centered`} key={skill.id} style={{ color: skill.color }}>
                            <i className={`nes-icon is-small`}>{skill.icon}</i> 
                        </div>
                    ))}
                </div>
            </section>
            <section className={styles.page}>
                <h3>Formazione</h3>
                <ul>
                    <li>Master in Web Development - Boolean Careers</li>
                    <li>Diploma in Informatica - Istituto Tecnico Industriale</li>
                </ul>
            </section>
        </div>
    );
}