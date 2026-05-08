import { useEffect, useRef, useState } from 'react';
import denBackground from '/assets/images/den.png';
import MODAL_DATA from '../data/ModalData';
import BaseModal from '../components/ui/modals/BaseModal';

export default function HomePage() {


    const [hasMoved, setHasMoved] = useState(false);
    // Preload delle immagini dei modali
    useEffect(() => {
        MODAL_DATA.forEach((modal) => {
            const img = new Image();
            img.src = modal.picture;
        });
    }, []);

    

    // Ref per il container scrollabile
    const scrollRef = useRef(null);

    function centerBackground() {
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
    const dragRaf = useRef(null);
    const pendingClientX = useRef(0);

    function handleGrab(event) {
        if (!hasMoved) {
            setHasMoved(true);
        }
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
        if (dragRaf.current) {
            cancelAnimationFrame(dragRaf.current);
            dragRaf.current = null;
        }
    }

    function handleMovement(event) {
        const container = scrollRef.current;
        if (!isHolding.current || !container || activeSection !== null) return;

        // Salvo solo l'ultimo input del mouse
        pendingClientX.current = event.clientX;

        // Se un frame è già schedulato, non ne pianifico un altro
        if (dragRaf.current) return;

        dragRaf.current = requestAnimationFrame(() => {
            const x = pendingClientX.current - container.offsetLeft;
            const walk = (x - startX.current) * 2;

            if (Math.abs(x - startX.current) > 5) {
                isDragging.current = true;
            }

            container.scrollLeft = scrollLeft.current - walk;
            dragRaf.current = null;
        });
    }

    // Cleanup per cancellare eventuali animazioni frame pendenti quando il componente viene smontato
    useEffect(() => {
        return () => {
            if (dragRaf.current) {
                cancelAnimationFrame(dragRaf.current);
            }
        };
    }, []);

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
            {(!hasMoved &&
                <>
                    <div className="scrollGuideLeft"></div>
                    <div className="scrollGuideRight"></div>
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