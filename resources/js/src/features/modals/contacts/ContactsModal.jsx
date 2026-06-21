import styles from './ContactsModal.module.css';
import { memo, useCallback, useRef, useState } from 'react';
import contacts from './contactsData';
import { isExternalWebLink } from '../../../utils/links';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';

const ContactsModal = memo(function ContactsModal() {

    const [currentIndex, setCurrentIndex] = useState(-1);
    const contactRefs = useRef([]);

    const handleNavigate = useCallback((nextIndex) => {
        setCurrentIndex(nextIndex);
        contactRefs.current[nextIndex]?.focus({ preventScroll: true });
    }, []);

    useKeyboardNavigation({
        currentIndex,
        onNavigate: handleNavigate,
        totalItems: contacts.length,
        mode: 'linear',
        enabled: contacts.length > 0,
    });

    return (
        <div className={styles['contacts-container']}>
            <p className={styles['contact-intro']}>Il pappagallo è pronto a volare! Come vuoi contattarmi?</p>
            <div className={styles['contact-links']}>
                {contacts.map((contact, index) => (
                    <a
                        key={contact.id}
                        ref={(el) => {
                            contactRefs.current[index] = el;
                        }}
                        href={contact.href}
                        target={isExternalWebLink(contact.href) ? '_blank' : undefined}
                        rel={isExternalWebLink(contact.href) ? 'noopener noreferrer' : undefined}
                        className={`${styles['contact-card']} ${styles[contact.variantClass]} ${currentIndex === index ? styles['selected-contact'] : ''}`}
                        aria-label={contact.ariaLabel}
                    >
                        <span className={styles.icon}>{contact.icon}</span>
                        <span className={styles.label}>{contact.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
});

export default ContactsModal;