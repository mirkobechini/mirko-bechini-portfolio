/* React & Libraries */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* Components */
import BaseModal from '../components/ui/modals/BaseModal';

/* Hooks & Context */
import { useDragScroll } from '../hooks/useDragScroll';
import GlobalContext from '../context/GlobalContext';

/* Utils */
import { getAssetPath } from '../utils/assets';
import { preloadImages } from '../utils/preloadImages';

/* Data & Constants */
import MODAL_DATA from '../data/ModalData';
import { MODAL_IDS } from '../data/uiConstants';

/* Assets */
const denBackground = getAssetPath('/backgrounds/den.webp');

export default function HomePage() {
    // Refs
    const scrollRef = useRef(null);
    const preloadedSpritesRef = useRef(new Set());
    const spriteButtonRefs = useRef({});

    // State
    const { activeSection, setActiveSection } = useContext(GlobalContext);
    const [loadedHomeSprites, setLoadedHomeSprites] = useState(() => new Set());

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

    const homeSpriteById = useMemo(() => ({
        [MODAL_IDS.ABOUT_ME]: getAssetPath('/sprites/monkey.webp'),
        [MODAL_IDS.BOOKSHELF]: getAssetPath('/sprites/book.webp'),
        [MODAL_IDS.PROJECTS]: getAssetPath('/sprites/desk.webp'),
        [MODAL_IDS.CONTACTS]: getAssetPath('/sprites/parrot.webp'),
        [MODAL_IDS.CERTIFICATIONS]: getAssetPath('/sprites/painting.webp'),
    }), []);

    const markSpriteAsLoaded = useCallback((id) => {
        setLoadedHomeSprites((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const getSpriteStyle = useCallback((id) => {
        if (!loadedHomeSprites.has(id)) return undefined;
        return { backgroundImage: `url(${homeSpriteById[id]})` };
    }, [homeSpriteById, loadedHomeSprites]);

    useEffect(() => {
        const rootElement = scrollRef.current;
        if (!rootElement) return;

        // Fallback: su browser senza IntersectionObserver carichiamo subito le sprite per evitare elementi vuoti.
        if (!('IntersectionObserver' in window)) {
            Object.values(MODAL_IDS).forEach((id) => markSpriteAsLoaded(id));
            return;
        }

        // Carica ogni sprite solo quando sta entrando nel viewport orizzontale (con anticipo), riducendo le offscreen requests iniziali.
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const target = entry.target;
                    const id = Number(target.getAttribute('data-sprite-id'));
                    if (!Number.isNaN(id)) {
                        markSpriteAsLoaded(id);
                    }
                    observer.unobserve(target);
                });
            },
            {
                root: rootElement,
                rootMargin: '0px 320px 0px 320px',
                threshold: 0.01,
            }
        );

        Object.values(spriteButtonRefs.current).forEach((element) => {
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [markSpriteAsLoaded]);

    // Handlers
    const closeModal = () => {
        setActiveSection(null);
    };

    const openModal = (id) => {
        if (!isDragging.current) {
            const selectedModal = modalById[id];
            if (selectedModal) {
                setActiveSection(selectedModal);
            }
        }
    };

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

                <button
                    ref={(element) => {
                        spriteButtonRefs.current[MODAL_IDS.ABOUT_ME] = element;
                    }}
                    data-sprite-id={MODAL_IDS.ABOUT_ME}
                    className='sprite monkey'
                    style={getSpriteStyle(MODAL_IDS.ABOUT_ME)}
                    aria-label="Sezione Chi Sono"
                    title='About me'
                    onClick={() => openModal(MODAL_IDS.ABOUT_ME)}
                    onMouseEnter={() => {
                        markSpriteAsLoaded(MODAL_IDS.ABOUT_ME);
                        preloadModalSprite(MODAL_IDS.ABOUT_ME);
                    }}
                    onFocus={() => {
                        markSpriteAsLoaded(MODAL_IDS.ABOUT_ME);
                        preloadModalSprite(MODAL_IDS.ABOUT_ME);
                    }}
                    onTouchStart={() => {
                        markSpriteAsLoaded(MODAL_IDS.ABOUT_ME);
                        preloadModalSprite(MODAL_IDS.ABOUT_ME);
                    }}
                >
                    <div className="sprite-tag">Chi Sono</div>
                </button>
                <button
                    ref={(element) => {
                        spriteButtonRefs.current[MODAL_IDS.BOOKSHELF] = element;
                    }}
                    data-sprite-id={MODAL_IDS.BOOKSHELF}
                    className='sprite library'
                    style={getSpriteStyle(MODAL_IDS.BOOKSHELF)}
                    aria-label="Sezione Formazione & Competenze"
                    title='Formation & Skills'
                    onClick={() => openModal(MODAL_IDS.BOOKSHELF)}
                    onMouseEnter={() => {
                        markSpriteAsLoaded(MODAL_IDS.BOOKSHELF);
                        preloadModalSprite(MODAL_IDS.BOOKSHELF);
                    }}
                    onFocus={() => {
                        markSpriteAsLoaded(MODAL_IDS.BOOKSHELF);
                        preloadModalSprite(MODAL_IDS.BOOKSHELF);
                    }}
                    onTouchStart={() => {
                        markSpriteAsLoaded(MODAL_IDS.BOOKSHELF);
                        preloadModalSprite(MODAL_IDS.BOOKSHELF);
                    }}
                >
                    <div className="sprite-tag">Formazione & Competenze</div>
                </button>
                <button
                    ref={(element) => {
                        spriteButtonRefs.current[MODAL_IDS.PROJECTS] = element;
                    }}
                    data-sprite-id={MODAL_IDS.PROJECTS}
                    className='sprite desk'
                    style={getSpriteStyle(MODAL_IDS.PROJECTS)}
                    aria-label="Sezione Esperienze & Progetti"
                    title='Experiences & Projects'
                    onClick={() => openModal(MODAL_IDS.PROJECTS)}
                    onMouseEnter={() => {
                        markSpriteAsLoaded(MODAL_IDS.PROJECTS);
                        preloadModalSprite(MODAL_IDS.PROJECTS);
                    }}
                    onFocus={() => {
                        markSpriteAsLoaded(MODAL_IDS.PROJECTS);
                        preloadModalSprite(MODAL_IDS.PROJECTS);
                    }}
                    onTouchStart={() => {
                        markSpriteAsLoaded(MODAL_IDS.PROJECTS);
                        preloadModalSprite(MODAL_IDS.PROJECTS);
                    }}
                >
                    <div className="sprite-tag">Esperienze & Progetti</div>
                </button>
                <button
                    ref={(element) => {
                        spriteButtonRefs.current[MODAL_IDS.CONTACTS] = element;
                    }}
                    data-sprite-id={MODAL_IDS.CONTACTS}
                    className='sprite parrot'
                    style={getSpriteStyle(MODAL_IDS.CONTACTS)}
                    aria-label="Sezione Contatti"
                    title='Contacts'
                    onClick={() => openModal(MODAL_IDS.CONTACTS)}
                    onMouseEnter={() => {
                        markSpriteAsLoaded(MODAL_IDS.CONTACTS);
                        preloadModalSprite(MODAL_IDS.CONTACTS);
                    }}
                    onFocus={() => {
                        markSpriteAsLoaded(MODAL_IDS.CONTACTS);
                        preloadModalSprite(MODAL_IDS.CONTACTS);
                    }}
                    onTouchStart={() => {
                        markSpriteAsLoaded(MODAL_IDS.CONTACTS);
                        preloadModalSprite(MODAL_IDS.CONTACTS);
                    }}
                >
                    <div className="sprite-tag">Contatti</div>
                </button>
                <button
                    ref={(element) => {
                        spriteButtonRefs.current[MODAL_IDS.CERTIFICATIONS] = element;
                    }}
                    data-sprite-id={MODAL_IDS.CERTIFICATIONS}
                    className='sprite painting'
                    style={getSpriteStyle(MODAL_IDS.CERTIFICATIONS)}
                    aria-label="Sezione Certificazioni"
                    title='Certifications'
                    onClick={() => openModal(MODAL_IDS.CERTIFICATIONS)}
                    onMouseEnter={() => {
                        markSpriteAsLoaded(MODAL_IDS.CERTIFICATIONS);
                        preloadModalSprite(MODAL_IDS.CERTIFICATIONS);
                    }}
                    onFocus={() => {
                        markSpriteAsLoaded(MODAL_IDS.CERTIFICATIONS);
                        preloadModalSprite(MODAL_IDS.CERTIFICATIONS);
                    }}
                    onTouchStart={() => {
                        markSpriteAsLoaded(MODAL_IDS.CERTIFICATIONS);
                        preloadModalSprite(MODAL_IDS.CERTIFICATIONS);
                    }}
                >
                    <div className="sprite-tag">Certificazioni</div>
                </button>
            </div>
            {activeSection && (<BaseModal key={`${activeSection.id}-${activeSection.sprite ?? ''}`} variant={activeSection} closeModal={closeModal} role="dialog" />)}
        </div >

    )
}