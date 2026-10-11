import { useCallback, useRef } from 'react';
import { preloadImages } from '../utils/preloadImages';

/**
 * Restituisce una funzione che precarica lo sprite della modal indicata (una sola volta per sprite).
 * @param {Object} modalById - mappa id -> config della modal (con la proprietà `sprite`)
 */
export default function useSpritePreload(modalById) {
    const preloadedSpritesRef = useRef(new Set());

    return useCallback((id) => {
        const sprite = modalById[id]?.sprite;

        if (!sprite || preloadedSpritesRef.current.has(sprite)) {
            return;
        }

        preloadedSpritesRef.current.add(sprite);
        preloadImages([sprite]);
    }, [modalById]);
}
