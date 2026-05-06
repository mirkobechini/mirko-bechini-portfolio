import { useEffect, useRef } from 'react';
import styles from '../modalsCss/BaseModal.module.css';

export default function BaseModal({ variant, closeModal }) {
    const closeBtnRef = useRef(null);

    // Chiusura con tasto ESC + focus sul pulsante all'apertura
    useEffect(() => {
        closeBtnRef.current?.focus();

        function handleKeyDown(e) {
            if (e.key === 'Escape') closeModal();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeModal]);

    return (
        <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalHeader}>
                <h2 id="modal-title" className={styles.modalTitle}>{variant.title}</h2>
            </div>
            <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`${styles.gameModal} ${styles[`theme-${variant.theme}`]}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalContent}>
                    {variant.content}
                </div>
                <div className={styles.modalFooter}>
                    <button ref={closeBtnRef} className={styles.gameBtn} onClick={closeModal}>CONTINUA</button>
                </div>
                <img className={styles.modalSprite} src={variant.picture} alt={`${variant.theme} modal sprite`} />
            </div>
        </div>
    );
}