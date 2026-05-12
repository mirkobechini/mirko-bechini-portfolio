import styles from '../modalsCss/ContactsModal.module.css';
import { memo } from 'react';

const ContactsModal = memo(function ContactsModal() {
    return (
        <div className={styles['contacts-container']}>
            <p className={styles['contact-intro']}>Il pappagallo è pronto a volare! Come vuoi contattarmi?</p>
            <div className={styles['contact-links']}>
                <a href="mailto:mirkobechini@gmail.com" className={`${styles['contact-card']} ${styles.mail}`}>
                    <span className={styles.icon}>✉️</span>
                    <span className={styles.label}>Email</span>
                </a>
                <a href="https://www.linkedin.com/in/mirko-bechini-892202252/" target="_blank" rel="noopener noreferrer" className={`${styles['contact-card']} ${styles.linkedin}`}>
                    <span className={styles.icon}>🔗</span>
                    <span className={styles.label}>LinkedIn</span>
                </a>
                <a href="https://github.com/mirkobechini" target="_blank" rel="noopener noreferrer" className={`${styles['contact-card']} ${styles.github}`}>
                    <span className={styles.icon}>💻</span>
                    <span className={styles.label}>GitHub</span>
                </a>
            </div>
        </div>
    );
});

export default ContactsModal;