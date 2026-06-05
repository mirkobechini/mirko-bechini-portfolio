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
import MODAL_DATA from '../data/ModalData';
import { MODAL_IDS } from '../data/uiConstants';

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

                <button className='sprite monkey' aria-label="Sezione Chi Sono" title='About me' onClick={() => openModal(MODAL_IDS.ABOUT_ME)} onMouseEnter={() => preloadModalSprite(MODAL_IDS.ABOUT_ME)} onFocus={() => preloadModalSprite(MODAL_IDS.ABOUT_ME)} onTouchStart={() => preloadModalSprite(MODAL_IDS.ABOUT_ME)}>
                    <div className="sprite-tag">Chi Sono</div>
                </button>
                <button className='sprite library' aria-label="Sezione Formazione & Competenze" title='Formation & Skills' onClick={() => openModal(MODAL_IDS.BOOKSHELF)} onMouseEnter={() => preloadModalSprite(MODAL_IDS.BOOKSHELF)} onFocus={() => preloadModalSprite(MODAL_IDS.BOOKSHELF)} onTouchStart={() => preloadModalSprite(MODAL_IDS.BOOKSHELF)}>
                    <div className="sprite-tag">Formazione & Competenze</div>
                </button>
                <button className='sprite desk' aria-label="Sezione Esperienze & Progetti" title='Experiences & Projects' onClick={() => openModal(MODAL_IDS.PROJECTS)} onMouseEnter={() => preloadModalSprite(MODAL_IDS.PROJECTS)} onFocus={() => preloadModalSprite(MODAL_IDS.PROJECTS)} onTouchStart={() => preloadModalSprite(MODAL_IDS.PROJECTS)}>
                    <div className="sprite-tag">Esperienze & Progetti</div>
                </button>
                <button className='sprite parrot' aria-label="Sezione Contatti" title='Contacts' onClick={() => openModal(MODAL_IDS.CONTACTS)} onMouseEnter={() => preloadModalSprite(MODAL_IDS.CONTACTS)} onFocus={() => preloadModalSprite(MODAL_IDS.CONTACTS)} onTouchStart={() => preloadModalSprite(MODAL_IDS.CONTACTS)}>
                    <div className="sprite-tag">Contatti</div>
                </button>
                <button className='sprite painting' aria-label="Sezione Certificazioni" title='Certifications' onClick={() => openModal(MODAL_IDS.CERTIFICATIONS)} onMouseEnter={() => preloadModalSprite(MODAL_IDS.CERTIFICATIONS)} onFocus={() => preloadModalSprite(MODAL_IDS.CERTIFICATIONS)} onTouchStart={() => preloadModalSprite(MODAL_IDS.CERTIFICATIONS)}>
                    <div className="sprite-tag">Certificazioni</div>
                </button>
            </div>
            {activeSection && (<BaseModal key={`${activeSection.id}-${activeSection.sprite ?? ''}`} variant={activeSection} closeModal={closeModal} role="dialog" />)}
        </div >

    )
}