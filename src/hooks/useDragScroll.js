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

    // Salvo solo l'ultimo input del mouse
    pendingClientX.current = clientX;

    // Se un frame è già schedulato, non ne pianifico un altro
    if (dragRaf.current) return;

    dragRaf.current = requestAnimationFrame(() => {
      const x = pendingClientX.current - container.offsetLeft;
      const walk = (x - startX.current) * DRAG_SENSITIVITY;

      if (Math.abs(x - startX.current) > DRAG_THRESHOLD) {
        isDragging.current = true;
      }

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
    }
  }

  function handleMovement(event) {
    moveDrag(event.clientX);
  }

  // Touch
  function handleTouchStart(event) {
    startDrag(event.touches[0].clientX);
  }

  function handleTouchMove(event) {
    moveDrag(event.touches[0].clientX);
  }

  // Cleanup per cancellare eventuali animazioni frame pendenti quando il componente viene smontato
  useEffect(() => {
    centerBackground();
    window.addEventListener("load", centerBackground);
    window.addEventListener("resize", centerBackground);
    return () => {
      window.removeEventListener("load", centerBackground);
      window.removeEventListener("resize", centerBackground);
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
