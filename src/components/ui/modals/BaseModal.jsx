import { useEffect, useRef, Suspense } from 'react';
import ModalErrorBoundary from './ModalErrorBoundary';
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

    // Le dimensioni del modale sono gestite in BaseModal.module.css.

    return (
        <div className={`${styles['modal-overlay']} ${styles[`theme-${variant.theme}`]}`} data-modal-theme={variant.theme} onClick={closeModal}>
            <div className={styles['modal-header']}>
                <h2 id="modal-title" data-modal-slot="title" className={styles['modal-title']}>{variant.title}</h2>
            </div>
            <div role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-slot="modal" className={styles['game-modal']} onClick={(e) => e.stopPropagation()}>
                <div data-modal-slot="content" className={styles['modal-content']}>
                    <ModalErrorBoundary key={variant.id}>
                        <Suspense fallback={<LoadingFallback />}>
                            <Component />
                        </Suspense>
                    </ModalErrorBoundary>
                </div>
                <button ref={closeBtnRef} data-modal-slot="button" className={styles['game-btn']} onClick={closeModal}>CONTINUA</button>
                {variant.sprite && (
                    <img data-modal-slot="sprite" className={styles['modal-sprite']} src={variant.sprite} alt={`${variant.theme} modal sprite`} />
                )}
            </div>
        </div>
    );
}