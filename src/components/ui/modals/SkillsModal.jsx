import styles from '../modalsCss/SkillsModal.module.css';

export default function SkillsModal() {
    return (
        <div className={styles.book}>
            <section className={styles.page}>
                <h3>Competenze</h3>
                <ul>
                    <li><strong>Frontend</strong>: HTML5, CSS3, JavaScript</li>
                    <li><strong>Backend</strong>: Node.js, PHP</li>
                    <li><strong>Libraries</strong>: React, Axios</li>
                    <li><strong>Frameworks</strong>: React Router, Bootstrap, Laravel, Express</li>
                    <li><strong>Database</strong>: MySQL</li>
                    <li><strong>Version Control</strong>: Git, GitHub</li>
                    <li><strong>Tools</strong>: Blade, Vite, Postman, Figma</li>
                </ul>
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