import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSpritePreload from '../hooks/useSpritePreload';
import { preloadImages } from '../utils/preloadImages';

vi.mock('../utils/preloadImages', () => ({ preloadImages: vi.fn() }));

const modalById = {
    1: { id: 1, sprite: null },
    2: { id: 2, sprite: '/sprites/a.webp' },
    3: { id: 3, sprite: '/sprites/b.webp' },
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useSpritePreload', () => {
    it('precarica lo sprite della modal indicata', () => {
        const { result } = renderHook(() => useSpritePreload(modalById));

        result.current(2);

        expect(preloadImages).toHaveBeenCalledWith(['/sprites/a.webp']);
    });

    it('precarica ogni sprite una sola volta', () => {
        const { result } = renderHook(() => useSpritePreload(modalById));

        result.current(2);
        result.current(2);
        result.current(3);

        expect(preloadImages).toHaveBeenCalledTimes(2);
    });

    it('ignora modal senza sprite o id sconosciuti', () => {
        const { result } = renderHook(() => useSpritePreload(modalById));

        result.current(1);
        result.current(999);

        expect(preloadImages).not.toHaveBeenCalled();
    });

    it('mantiene la memoria degli sprite già caricati tra i render', () => {
        const { result, rerender } = renderHook(() => useSpritePreload(modalById));

        result.current(2);
        rerender();
        result.current(2);

        expect(preloadImages).toHaveBeenCalledTimes(1);
    });
});
