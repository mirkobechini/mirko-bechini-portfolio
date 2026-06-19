/* React & Libraries */
import { useCallback, useContext, useMemo, useRef } from 'react';

/* Components */
import BaseModal from '../features/modals/shared/BaseModal';

/* Hooks & Context */
import { useDragScroll } from '../hooks/useDragScroll';
import GlobalContext from '../context/GlobalContext';

/* Utils */
import { getAssetPath } from '../utils/assets';
import { preloadImages } from '../utils/preloadImages';

/* Data & Constants */
import MODAL_DATA from '../features/modals/modalRegistry';
import { MODAL_IDS } from '../data/uiConstants';

/* Assets */
const denBackground = getAssetPath('/backgrounds/den.webp');
const monkeySprite = getAssetPath('/sprites/monkey.webp');
const librarySprite = getAssetPath('/sprites/book.webp');
const deskSprite = getAssetPath('/sprites/desk.webp');
const parrotSprite = getAssetPath('/sprites/parrot.webp');
const paintingSprite = getAssetPath('/sprites/painting.webp');

export default function HomePage() {
    // Refs
    const scrollRef = useRef(null);
    const preloadedSpritesRef = useRef(new Set());

    // State
    const { activeSection, setActiveSection } = useContext(GlobalContext);

    // Custom hooks
    const { hasMoved, handleGrab, handleLeave, handleMovement, handleTouchStart, handleTouchMove, centerBackground, isDragging } =
        useDragScroll(scrollRef, activeSection !== null);

    const modalById = useMemo(
        () => Object.fromEntries(MODAL_DATA.map((modal) => [modal.id, modal])),
        []
    );

    const preloadModalSprite = useCallback((id) => {
        const selectedModal = modalById[id];
        const sprite = selectedModal?.sprite;

        if (!sprite || preloadedSpritesRef.current.has(sprite)) {
            return;
        }

        preloadedSpritesRef.current.add(sprite);
        preloadImages([sprite]);
    }, [modalById]);

    // Handlers
    const closeModal = useCallback(() => {
        setActiveSection(null);
    }, []);

    const openModal = useCallback((id) => {
        if (!isDragging.current) {
            const selectedModal = modalById[id];
            if (selectedModal) {
                setActiveSection(selectedModal);
            }
        }
    }, [modalById, isDragging]);

    // Preload handlers for sprite images
    const preloadHandlers = (id) => ({
        onMouseEnter: () => preloadModalSprite(id),
        onFocus: () => preloadModalSprite(id),
        onTouchStart: () => preloadModalSprite(id),
    });


    // Sprites data for rendering buttons
    const SPRITES = [
        {
            id: MODAL_IDS.ABOUT_ME, src: monkeySprite, className: 'monkey', label: 'Chi Sono',
            ariaLabel: 'Sezione Chi Sono', title: 'About me', alt: 'Scimmia sezione Chi Sono', fetchPriority: 'high'
        },
        {
            id: MODAL_IDS.BOOKSHELF, src: librarySprite, className: 'library', label: 'Formazione & Competenze',
            ariaLabel: 'Sezione Formazione & Competenze', title: 'Formation & Skills', alt: 'Libreria sezione Formazione & Competenze', fetchPriority: 'low'
        },
        {
            id: MODAL_IDS.PROJECTS, src: deskSprite, className: 'desk', label: 'Esperienze & Progetti',
            ariaLabel: 'Sezione Esperienze & Progetti', title: 'Experiences & Projects', alt: 'Scrivania sezione Esperienze & Progetti', fetchPriority: 'low'
        },
        {
            id: MODAL_IDS.CONTACTS, src: parrotSprite, className: 'parrot', label: 'Contatti',
            ariaLabel: 'Sezione Contatti', title: 'Contacts', alt: 'Pappagallo sezione Contatti', fetchPriority: 'low'
        },
        {
            id: MODAL_IDS.CERTIFICATIONS, src: paintingSprite, className: 'painting', label: 'Certificazioni',
            ariaLabel: 'Sezione Certificazioni', title: 'Certifications', alt: 'Quadro sezione Certificazioni', fetchPriority: 'low'
        },
    ];

    return (
        <div className="den-container" ref={scrollRef} onMouseDown={handleGrab} onMouseLeave={handleLeave} onMouseUp={handleLeave} onMouseMove={handleMovement} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleLeave}>
            {(!hasMoved &&
                <>
                    <div className="scroll-guide-left"></div>
                    <div className="scroll-guide-right"></div>
                </>
            )}
            <div className="den-wrapper">

                <img className="den-image" src={denBackground} onLoad={centerBackground} alt="Monkey Den" draggable="false" loading="eager" fetchPriority="high" decoding="async" width="1568" height="454" />

                {SPRITES.map(({ id, src, className, label, ariaLabel, title, alt, fetchPriority }) => (
                    <button
                        key={id}
                        className={`sprite ${className}`}
                        aria-label={ariaLabel}
                        title={title}
                        onClick={() => openModal(id)}
                        {...preloadHandlers(id)}
                    >
                        <img src={src} alt={alt} className="sprite-character" fetchPriority={fetchPriority} draggable="false" />
                        <div className="nes-container is-rounded sprite-tag">{label}</div>
                    </button>
                ))}
            </div>
            {activeSection && (<BaseModal key={`${activeSection.id}-${activeSection.sprite ?? ''}`} variant={activeSection} closeModal={closeModal} role="dialog" />)}
        </div >

    )
}