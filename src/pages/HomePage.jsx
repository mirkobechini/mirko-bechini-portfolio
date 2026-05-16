/* React & Libraries */
import { useContext, useEffect, useRef } from 'react';

/* Components */
import BaseModal from '../components/ui/modals/BaseModal';

/* Hooks & Context */
import { useDragScroll } from '../hooks/useDragScroll';
import GlobalContext from '../context/GlobalContext';

/* Data & Constants */
import MODAL_DATA from '../data/ModalData';
import { MODAL_IDS } from '../data/uiConstants';

/* Assets */
const denBackground = import.meta.env.VITE_ASSETS_PATH + '/backgrounds/den.png';

export default function HomePage() {
    // Refs
    const scrollRef = useRef(null);

    // State
    const { activeSection, setActiveSection } = useContext(GlobalContext);

    // Custom hooks
    const { hasMoved, handleGrab, handleLeave, handleMovement, handleTouchStart, handleTouchMove, centerBackground, isDragging } =
        useDragScroll(scrollRef, activeSection !== null);

    // Effects
    useEffect(() => {
        // Preload delle immagini dei modali
        MODAL_DATA.forEach((modal) => {
            if (!modal.sprite) return;
            const img = new Image();
            img.src = modal.sprite;
        });
    }, []);

    // Handlers
    const closeModal = () => {
        setActiveSection(null);
    };

    const openModal = (id) => {
        if (!isDragging.current) {
            const selectedModal = MODAL_DATA.find(modal => modal.id === id);
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

                <img className="den-image" src={denBackground} onLoad={centerBackground} alt="Monkey Den" draggable="false" />

                <button className='sprite monkey' aria-label="Sezione Chi Sono" title='About me' onClick={() => openModal(MODAL_IDS.ABOUT_ME)}></button>
                <button className='sprite library' aria-label="Sezione Formazione & Competenze" title='Formation & Skills' onClick={() => openModal(MODAL_IDS.SKILLS)}></button>
                <button className='sprite desk' aria-label="Sezione Esperienze & Progetti" title='Experiences & Projects' onClick={() => openModal(MODAL_IDS.PROJECTS)}></button>
                <button className='sprite parrot' aria-label="Sezione Contatti" title='Contacts' onClick={() => openModal(MODAL_IDS.CONTACTS)}></button>
                <button className='sprite painting' aria-label="Sezione Certificazioni" title='Certifications' onClick={() => openModal(MODAL_IDS.CERTIFICATIONS)}></button>
            </div>
            {activeSection && (<BaseModal variant={activeSection} closeModal={closeModal} role="dialog" />)}
        </div >

    )
}