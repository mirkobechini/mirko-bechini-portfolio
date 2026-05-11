import { useEffect, useRef, Suspense } from 'react';
import styles from '../modalsCss/BaseModal.module.css';

const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>Caricamento...</p>
    </div>
);

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

    const Component = variant.component;

    //TODO: every modal should have same width and height modifying the css and not the component, maybe add a prop for custom sizes if needed in the future

    return (
        <div className={`${styles.modalOverlay} ${styles[`theme-${variant.theme}`]}`} onClick={closeModal}>
            <div className={styles.modalHeader}>
                <h2 id="modal-title" className={styles.modalTitle}>{variant.title}</h2>
            </div>
            <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`${styles.gameModal}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalContent}>
                    <Suspense key={variant.id} fallback={<LoadingFallback />}>
                        <Component />
                    </Suspense>
                </div>
                <div className={styles.modalFooter}>
                    <button ref={closeBtnRef} className={styles.gameBtn} onClick={closeModal}>CONTINUA</button>
                </div>
                <img className={styles.modalSprite} src={variant.picture} alt={`${variant.theme} modal sprite`} />
            </div>
        </div>
    );
}