import { useEffect, useRef, useState, Suspense } from 'react';
import ModalErrorBoundary from './ModalErrorBoundary';
import styles from '../modalsCss/BaseModal.module.css';
import '../modalsCss/SharedModal.module.css';

const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>Caricamento...</p>
    </div>
);

export default function BaseModal({ variant, closeModal }) {
    const closeBtnRef = useRef(null);
    const dialogRef = useRef(null);
    const previousFocusRef = useRef(null);
    const [spriteSrc, setSpriteSrc] = useState(variant.sprite ?? null);

    function getFocusableElements() {
        const dialogElement = dialogRef.current;
        if (!dialogElement) return [];

        const focusableSelector = [
            'a[href]',
            'area[href]',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable="true"]',
            '[tabindex]:not([tabindex="-1"])',
        ].join(',');

        return Array.from(dialogElement.querySelectorAll(focusableSelector)).filter((element) => {
            if (!(element instanceof HTMLElement)) return false;
            if (element.getAttribute('aria-hidden') === 'true') return false;
            return element.getClientRects().length > 0;
        });
    }

    // Chiusura con ESC + focus trap all'interno del modale
    useEffect(() => {
        previousFocusRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        closeBtnRef.current?.focus();

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                closeModal();
                return;
            }

            if (e.key !== 'Tab') return;

            const dialogElement = dialogRef.current;
            if (!dialogElement) return;

            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) {
                e.preventDefault();
                dialogElement.focus({ preventScroll: true });
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;
            const isFocusOutsideDialog = !(activeElement instanceof Node) || !dialogElement.contains(activeElement);

            if (e.shiftKey) {
                if (activeElement === firstElement || isFocusOutsideDialog) {
                    e.preventDefault();
                    lastElement.focus({ preventScroll: true });
                }
                return;
            }

            if (activeElement === lastElement || isFocusOutsideDialog) {
                e.preventDefault();
                firstElement.focus({ preventScroll: true });
            }
        }

        function handleFocusIn(event) {
            const dialogElement = dialogRef.current;
            if (!dialogElement) return;
            if (event.target instanceof Node && dialogElement.contains(event.target)) return;

            const focusableElements = getFocusableElements();
            const fallbackTarget = focusableElements[0] ?? dialogElement;
            fallbackTarget.focus({ preventScroll: true });
        }

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('focusin', handleFocusIn, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('focusin', handleFocusIn, true);
            previousFocusRef.current?.focus({ preventScroll: true });
        };
    }, [closeModal]);

    const Component = variant.component;

    // Le dimensioni del modale sono gestite in BaseModal.module.css.

    return (
        <div className={`${styles['modal-overlay']} ${styles[`theme-${variant.theme}`]}`} data-modal-theme={variant.theme} onClick={closeModal}>
            <div className={styles['modal-header']}>
                <h2 id="modal-title" data-modal-slot="title" className={styles['modal-title']}>{variant.title}</h2>
            </div>
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-slot="modal" className={styles['game-modal']} onClick={(e) => e.stopPropagation()} tabIndex={-1}>
                <div data-modal-slot="content" className={styles['modal-content']}>
                    <ModalErrorBoundary key={variant.id}>
                        <Suspense fallback={<LoadingFallback />}>
                            <Component setModalSprite={setSpriteSrc} defaultModalSprite={variant.sprite ?? null} />
                        </Suspense>
                    </ModalErrorBoundary>
                </div>
                <button ref={closeBtnRef} data-modal-slot="button" className={styles['game-btn']} onClick={closeModal}>CONTINUA</button>
                {spriteSrc && (
                    <img data-modal-slot="sprite" className={styles['modal-sprite']} src={spriteSrc} alt={`${variant.theme} modal sprite`} width="640" height="640" />
                )}
            </div>
        </div>
    );
}