/* React & Libraries */
import { useEffect, useRef, useState, useCallback } from "react";
import { DRAG_SENSITIVITY, DRAG_THRESHOLD } from "../data/uiConstants";

export const useDragScroll = (scrollRef, isDragDisabled) => {
  // State
  const [hasMoved, setHasMoved] = useState(false);

  // Refs
  const isHolding = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragRaf = useRef(null);
  const pendingClientX = useRef(0);

  // Helper functions
  const centerBackground = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      const scrollCenter = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollLeft = scrollCenter;
    }
  }, [scrollRef]);

  function startDrag(clientX) {
    if (!hasMoved) {
      setHasMoved(true);
    }
    const container = scrollRef.current;
    if (!container) return;
    // Verifica se il pulsante sinistro del mouse è premuto
    isHolding.current = true;
    isDragging.current = false;
    startX.current = clientX - container.offsetLeft;
    scrollLeft.current = container.scrollLeft;
  }

  function moveDrag(clientX) {
    const container = scrollRef.current;
    if (!isHolding.current || !container || isDragDisabled) return;

    const x = clientX - container.offsetLeft;

    // Determinazione drag/click: SINCRONA, non dipende dalla RAF
    if (!isDragging.current && Math.abs(x - startX.current) > DRAG_THRESHOLD) {
      isDragging.current = true;
    }


    // Salvo solo l'ultimo input del mouse
    pendingClientX.current = clientX;

    // Se un frame è già schedulato, non ne pianifico un altro
    if (dragRaf.current) return;

    dragRaf.current = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) {
        dragRaf.current = null;
        return;
      }
      // Leggi offsetLeft una volta sola e riutilizzalo
      const offsetLeft = container.offsetLeft;
      const x = pendingClientX.current - offsetLeft;
      const walk = (x - startX.current) * DRAG_SENSITIVITY;

      container.scrollLeft = scrollLeft.current - walk;
      dragRaf.current = null;
    });
  }

  // Event handlers
  // Mouse
  function handleGrab(event) {
    startDrag(event.clientX);
  }

  function handleLeave() {
    isHolding.current = false;
    if (dragRaf.current) {
      cancelAnimationFrame(dragRaf.current);
      dragRaf.current = null;

      // Applica l'ultimo movimento pendente prima di fermarsi del tutto
      const container = scrollRef.current;
      if (container) {
        const offsetLeft = container.offsetLeft;
        const x = pendingClientX.current - offsetLeft;
        const walk = (x - startX.current) * DRAG_SENSITIVITY;
        container.scrollLeft = scrollLeft.current - walk;
      }
    }
  }

  function handleMovement(event) {
    moveDrag(event.clientX);
  }

  // Touch
  function handleTouchStart(event) {
    // NON preventDefault qui: lascia che i click (tap) funzionino sui pulsanti
    startDrag(event.touches[0].clientX);
  }

  function handleTouchMove(event) {
    moveDrag(event.touches[0].clientX);

    // Previeni scroll nativo solo se l'utente sta effettivamente dragando
    if (isDragging.current) {
      event.preventDefault();
    }
  }

  // Cleanup per cancellare eventuali animazioni frame pendenti quando il componente viene smontato
  useEffect(() => {
    centerBackground();
    window.addEventListener("load", centerBackground);
    return () => {
      window.removeEventListener("load", centerBackground);
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
      }
    };
  }, [centerBackground]);

  return {
    hasMoved,
    handleGrab,
    handleLeave,
    handleMovement,
    handleTouchStart,
    handleTouchMove,
    centerBackground,
    isDragging,
  };
};
