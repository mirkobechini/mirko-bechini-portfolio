import { useEffect, useRef, useState } from 'react';
import denBackground from '/assets/backgrounds/den.png';
import MODAL_DATA from '../data/ModalData';
import BaseModal from '../components/ui/modals/BaseModal';
import { useDragScroll } from '../hooks/useDragScroll';

export default function HomePage() {
  // Refs
  const scrollRef = useRef(null);

  // State
  const [activeSection, setActiveSection] = useState(null);

  // Custom hooks
  const { hasMoved, handleGrab, handleLeave, handleMovement, centerBackground, isDragging } =
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
      setActiveSection(MODAL_DATA.find(modal => modal.id === id));
    }
  };

    return (
        <div className="den-container" ref={scrollRef} onMouseDown={handleGrab} onMouseLeave={handleLeave} onMouseUp={handleLeave} onMouseMove={handleMovement}>
            {(!hasMoved &&
                <>
                    <div className="scroll-guide-left"></div>
                    <div className="scroll-guide-right"></div>
                </>
            )}
            <div className="den-wrapper">

                <img className="den-image" src={denBackground} onLoad={centerBackground} alt="Monkey Den" draggable="false" />

                <button className='sprite monkey' aria-label="Sezione Chi Sono" title='About me' onClick={() => openModal(1)}></button>
                <button className='sprite library' aria-label="Sezione Formazione & Competenze" title='Formation & Skills' onClick={() => openModal(2)}></button>
                <button className='sprite desk' aria-label="Sezione Esperienze & Progetti" title='Experiences & Projects' onClick={() => openModal(3)}></button>
                <button className='sprite parrot' aria-label="Sezione Contatti" title='Contacts' onClick={() => openModal(5)}></button>
                <button className='sprite painting' aria-label="Sezione Certificazioni" title='Certifications' onClick={() => openModal(4)}></button>
            </div>
            {activeSection && (<BaseModal variant={activeSection} closeModal={closeModal} role="dialog" />)}
        </div >

    )
}