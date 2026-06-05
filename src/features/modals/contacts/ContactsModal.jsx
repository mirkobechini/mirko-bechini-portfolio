import styles from './ContactsModal.module.css';
import { memo, useEffect, useRef, useState } from 'react';
import contacts from '../../../data/contactsData';
import { isExternalWebLink } from '../../../utils/links';

const ContactsModal = memo(function ContactsModal() {


    const [currentIndex, setCurrentIndex] = useState(-1);
    const contactRefs = useRef([]);

    const moveToPreviousContact = () => {
        setCurrentIndex((prevIndex) => {
            if (contacts.length === 0) return -1;
            if (prevIndex < 0) return contacts.length - 1;
            return (prevIndex - 1 + contacts.length) % contacts.length;
        });
    };

    const moveToNextContact = () => {
        setCurrentIndex((prevIndex) => {
            if (contacts.length === 0) return -1;
            if (prevIndex < 0) return 0;
            return (prevIndex + 1) % contacts.length;
        });
    };

    useEffect(() => {
        if (currentIndex >= 0) {
            contactRefs.current[currentIndex]?.focus({ preventScroll: true });
        }
    }, [currentIndex]);

    useEffect(() => {
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

            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                moveToPreviousContact();
                return;
            }

            moveToNextContact();
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

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

//TODO: add label for arrow functionality tutorial

export default ContactsModal;