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
        // After the modal unmounts and restores focus to the sprite button,
        // remove focus so the sprite-tag doesn't stay visible via :focus CSS
        requestAnimationFrame(() => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });
    }, [setActiveSection]);

    const openModal = useCallback((id) => {
        if (!isDragging.current) {
            const selectedModal = modalById[id];
            if (selectedModal) {
                setActiveSection(selectedModal);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalById, setActiveSection]);

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

                {SPRITES.map(({ id, src, srcSm, srcMd, className, label, ariaLabel, title, alt, fetchPriority, loading, width, height }) => (
                    <button
                        key={id}
                        className={`sprite ${className}`}
                        aria-label={ariaLabel}
                        title={title}
                        onClick={() => openModal(id)}
                        {...preloadHandlers(id)}
                    >
                        <img
                            src={src}
                            srcSet={`${srcSm} ${Math.round(width * 0.5)}w, ${srcMd} ${Math.round(width * 0.75)}w, ${src} ${width}w`}
                            sizes="(max-width: 767px) 40vw, 20vw"
                            alt={alt}
                            className="sprite-character"
                            fetchPriority={fetchPriority}
                            loading={loading}
                            width={width}
                            height={height}
                            draggable="false"
                        />
                        <div className="nes-container is-rounded sprite-tag">{label}</div>
                    </button>
                ))}
            </div>
            {activeSection && (<BaseModal key={`${activeSection.id}-${activeSection.sprite ?? ''}`} variant={activeSection} closeModal={closeModal} openModal={openModal} role="dialog" />)}
        </div >

    )
}