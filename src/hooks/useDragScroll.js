/* React & Libraries */
import { useEffect, useRef, useState } from 'react';

export const useDragScroll = (scrollRef, isDragDisabled) => {
    // State
    const [hasMoved, setHasMoved] = useState(false);

    // Refs - TODO: mappare onTouchStart, onTouchMove e onTouchEnd per mobile
    const isHolding = useRef(false);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const dragRaf = useRef(null);
    const pendingClientX = useRef(0);

    // Helper functions
    function centerBackground() {
        const container = scrollRef.current;
        if (container) {
            const scrollCenter = (container.scrollWidth - container.clientWidth) / 2;
            container.scrollLeft = scrollCenter;
        }
    }

    // Event handlers
    function handleGrab(event) {
        if (!hasMoved) {
            setHasMoved(true);
        }
        const container = scrollRef.current;
        if (container) {
            // Verifica se il pulsante sinistro del mouse è premuto
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
        if (!isHolding.current || !container || isDragDisabled) return;

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

    return {
        hasMoved,
        handleGrab,
        handleLeave,
        handleMovement,
        centerBackground,
        isDragging,
    };
};
