/* React & Libraries */
import { useCallback, useContext, useMemo, useRef } from 'react';

/* Components */
import BaseModal from '../features/modals/shared/BaseModal';
import ScrollGuideIndicators from '../components/ui/ScrollGuideIndicators';

/* Hooks & Context */
import { useDragScroll } from '../hooks/useDragScroll';
import GlobalContext from '../context/GlobalContext';

/* Utils */
import { getAssetPath } from '../utils/assets';
import { preloadImages } from '../utils/preloadImages';

/* Data & Constants */
import MODAL_DATA from '../features/modals/modalRegistry';
import SPRITES from '../data/spriteConfig';

/* Assets */
const denBackground = getAssetPath('/backgrounds/den.webp');

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
    }, [setActiveSection]);

    const openModal = useCallback((id) => {
        if (!isDragging.current) {
            const selectedModal = modalById[id];
            if (selectedModal) {
                setActiveSection(selectedModal);
            }
        }
    }, [modalById, isDragging, setActiveSection]);

    // Preload handlers for sprite images
    const preloadHandlers = (id) => ({
        onMouseEnter: () => preloadModalSprite(id),
        onFocus: () => preloadModalSprite(id),
        onTouchStart: () => preloadModalSprite(id),
    });

    return (
        <div className="den-container" ref={scrollRef} onMouseDown={handleGrab} onMouseLeave={handleLeave} onMouseUp={handleLeave} onMouseMove={handleMovement} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleLeave}>
            {!hasMoved && <ScrollGuideIndicators />}
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