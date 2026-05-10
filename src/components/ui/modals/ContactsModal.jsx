import styles from '../modalsCss/ContactsModal.module.css';
import { memo } from 'react';

const ContactsModal = memo(function ContactsModal() {
    return (
        <div className={styles.contactsContainer}>
            <p className={styles.contactIntro}>Il pappagallo è pronto a volare! Come vuoi contattarmi?</p>
            <div className={styles.contactLinks}>
                <a href="mailto:mirkobechini@gmail.com" className={`${styles.contactCard} ${styles.mail}`}>
                    <span className={styles.icon}>✉️</span>
                    <span className={styles.label}>Email</span>
                </a>
                <a href="https://www.linkedin.com/in/mirko-bechini-892202252/" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.linkedin}`}>
                    <span className={styles.icon}>🔗</span>
                    <span className={styles.label}>LinkedIn</span>
                </a>
                <a href="https://github.com/mirkobechini" target="_blank" rel="noopener noreferrer" className={`${styles.contactCard} ${styles.github}`}>
                    <span className={styles.icon}>💻</span>
                    <span className={styles.label}>GitHub</span>
                </a>
            </div>
        </div>
    );
});

export default ContactsModal;