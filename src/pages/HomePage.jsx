import { useRef} from 'react';
import denBackground from '../assets/images/den.png';

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
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    function handleGrab(event) {
        const container = scrollRef.current;
        if (container) {
            isHolding.current = true;
            startX.current = event.clientX - container.offsetLeft;
            scrollLeft.current = container.scrollLeft;
        }
    }

    function handleLeave() {
        isHolding.current = false;
    }

    function handleMovement(event) {
        const container = scrollRef.current;
        if(isHolding.current && container) {
            event.preventDefault();
            const x = event.clientX - container.offsetLeft;
            const walk = (x - startX.current) * 2; // Velocità di scorrimento
            container.scrollLeft = scrollLeft.current - walk;
        }
    }

    return (
        <div className="den-wrapper" ref={scrollRef} onMouseDown={handleGrab} onMouseLeave={handleLeave} onMouseUp={handleLeave} onMouseMove={handleMovement}>
            <img className="den-image" src={denBackground} onLoad={centerBackground} alt="Monkey Den"  draggable="false"/> 
        </div>
    )
}