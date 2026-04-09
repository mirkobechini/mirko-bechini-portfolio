import { useRef, useState } from 'react';
import denBackground from '../assets/images/den.png';
import MODAL_DATA from '../data/ModalData';

export default function HomePage() {

    // Ref per il container scrollabile
    const scrollRef = useRef(null);

    function centerBackground(event) {
        const container = scrollRef.current;
        if (container) {
            const scrollCenter = (container.scrollWidth - container.clientWidth) / 2;
            container.scrollLeft = scrollCenter;
        }
    }

    //Drag and scroll
    //TODO: mappare onTouchStart, onTouchMove e onTouchEnd per mobile
    const isHolding = useRef(false);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    function handleGrab(event) {
        const container = scrollRef.current;
        if (container) { // Verifica se il pulsante sinistro del mouse è premuto
            isHolding.current = true;
            isDragging.current = false;
            startX.current = event.clientX - container.offsetLeft;
            scrollLeft.current = container.scrollLeft;
        }
    }

    function handleLeave() {
        isHolding.current = false;
    }

    function handleMovement(event) {
        const container = scrollRef.current;
        if (isHolding.current && container) {
            const x = event.clientX - container.offsetLeft;
            const walk = (x - startX.current) * 2; // Velocità di scorrimento

            if (Math.abs(x - startX.current) > 5) { // Se il movimento è significativo, consideralo come dragging
                isDragging.current = true;
            }

            container.scrollLeft = scrollLeft.current - walk;

        }
    }

    //Modals
    const [activeSection, setActiveSection] = useState(null);

    const closeModal = () => {
        setActiveSection(null);
    }

    const openModal = (id) => {
        if (!isDragging.current) {
            setActiveSection(MODAL_DATA.find(modal => modal.id === id));
        }
    }

    return (
        <div className="den-container" ref={scrollRef} onMouseDown={handleGrab} onMouseLeave={handleLeave} onMouseUp={handleLeave} onMouseMove={handleMovement}>
            <div className="den-wrapper">

                <img className="den-image" src={denBackground} onLoad={centerBackground} alt="Monkey Den" draggable="false" />

                <button className='sprite monkey' aria-label="Sezione Chi Sono" title='About me' onClick={() => openModal(1)}></button>
                <button className='sprite library' aria-label="Sezione Formazione & Competenze" title='Formation & Skills' onClick={() => openModal(2)}></button>
                <button className='sprite desk' aria-label="Sezione Esperienze & Progetti" title='Experiences & Projects' onClick={() => openModal(3)}></button>
                <button className='sprite parrot' aria-label="Sezione Contatti" title='Contacts' onClick={() => openModal(5)}></button>
                <button className='sprite painting' aria-label="Sezione Certificazioni" title='Certifications' onClick={() => openModal(4)}></button>
            </div>
            {activeSection && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className={`game-modal theme-${activeSection.theme}`} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{activeSection.title}</h2>
                            <button className='close-x' onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <p>{activeSection.content}</p>
                        </div>
                        <div className="modal-footer">
                            <button className='game-btn' onClick={closeModal}>CONTINUA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}