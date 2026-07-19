import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragScroll } from '../hooks/useDragScroll';

// Mock requestAnimationFrame
let rafCallbacks = [];
let rafId = 0;
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;

beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    global.requestAnimationFrame = (cb) => {
        rafCallbacks.push(cb);
        return ++rafId;
    };
    global.cancelAnimationFrame = (id) => {
        rafCallbacks = rafCallbacks.filter((_, i) => i !== id - 1);
    };
});

afterEach(() => {
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
});

function createMockContainer(scrollWidth = 2000, clientWidth = 1000) {
    const container = document.createElement('div');
    Object.defineProperties(container, {
        scrollWidth: { value: scrollWidth, writable: true },
        clientWidth: { value: clientWidth, writable: true },
        scrollLeft: { value: 0, writable: true },
        offsetLeft: { value: 0, writable: true },
    });
    return container;
}

describe('useDragScroll', () => {
    it('returns hasMoved as false initially', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));
        expect(result.current.hasMoved).toBe(false);
    });

    it('returns isDragging ref', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));
        expect(result.current.isDragging.current).toBe(false);
    });

    it('centers background scroll on mount', () => {
        const container = createMockContainer(2000, 1000);
        const ref = { current: container };
        renderHook(() => useDragScroll(ref, false));

        // centerBackground calcola (2000-1000)/2 = 500
        expect(container.scrollLeft).toBe(500);
    });

    it('sets hasMoved to true on grab', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));

        act(() => {
            result.current.handleGrab({ clientX: 100 });
        });

        expect(result.current.hasMoved).toBe(true);
    });

    it('sets isDragging to true after moving past threshold', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));

        act(() => {
            result.current.handleGrab({ clientX: 100 });
        });

        // DRAG_THRESHOLD = 5, muoviti di 10
        act(() => {
            result.current.handleMovement({ clientX: 110 });
        });

        // La RAF è schedulata, isDragging dovrebbe essere true
        expect(result.current.isDragging.current).toBe(true);
    });

    it('does not set isDragging for small movements', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));

        act(() => {
            result.current.handleGrab({ clientX: 100 });
        });

        act(() => {
            result.current.handleMovement({ clientX: 103 });
        });

        expect(result.current.isDragging.current).toBe(false);
    });

    it('does not move when isDragDisabled is true', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, true));

        act(() => {
            result.current.handleGrab({ clientX: 100 });
        });

        act(() => {
            result.current.handleMovement({ clientX: 200 });
        });

        // isDragging.current dovrebbe essere false
        expect(result.current.isDragging.current).toBe(false);
    });

    it('removes load event listener on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
        const ref = { current: createMockContainer() };

        const { unmount } = renderHook(() => useDragScroll(ref, false));
        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('handleLeave cleans up RAF', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));

        act(() => {
            result.current.handleGrab({ clientX: 100 });
        });

        act(() => {
            result.current.handleMovement({ clientX: 200 });
        });

        expect(rafCallbacks.length).toBe(1);

        act(() => {
            result.current.handleLeave();
        });

        // RAF cancellato, esegue ultimo movimento
        expect(rafCallbacks.length).toBe(0);
    });

    it('handles touch events', () => {
        const ref = { current: createMockContainer() };
        const { result } = renderHook(() => useDragScroll(ref, false));

        act(() => {
            result.current.handleTouchStart({ touches: [{ clientX: 100 }] });
        });

        expect(result.current.hasMoved).toBe(true);
    });

    it('handleGrab stores start position', () => {
        const container = createMockContainer();
        container.offsetLeft = 50;
        const ref = { current: container };
        const { result } = renderHook(() => useDragScroll(ref, false));

        act(() => {
            result.current.handleGrab({ clientX: 150 });
        });

        // startX = 150 - 50 = 100
        // Dopo moveDrag di 200, x = 200 - 50 = 150, walk = (150-100)*2 = 100
        // scrollLeft era 500 (centerBackground), quindi scrollLeft = 500 - 100 = 400
        act(() => {
            result.current.handleMovement({ clientX: 200 });
        });

        // Esegue RAF
        act(() => {
            rafCallbacks.forEach(cb => cb());
        });

        expect(container.scrollLeft).toBe(400);
    });
});