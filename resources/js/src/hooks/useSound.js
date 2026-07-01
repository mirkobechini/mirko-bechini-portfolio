import { useCallback, useRef } from 'react';
import { getAssetPath } from '../utils/assets';

const SOUND_FILES = [
    getAssetPath('/sounds/about/monkey-1.ogg'),
    getAssetPath('/sounds/about/monkey-2.ogg'),
    getAssetPath('/sounds/about/monkey-3.ogg'),
];

/**
 * Hook that provides functions to play monkey sounds with debounce.
 * Crea un nuovo Audio ad ogni chiamata per evitare conflitti di stato.
 * @param {number} debounceMs - Minimum interval between sounds in ms (default: 800)
 * @returns {{ playSoundShort: () => void, playSoundFull: () => void }}
 */
export default function useSound(debounceMs = 800) {
    const lastHoverRef = useRef(0);
    const lastClickRef = useRef(0);

    const play = useCallback((isShort) => {
        const now = Date.now();
        const lastRef = isShort ? lastHoverRef : lastClickRef;

        if (now - lastRef.current < debounceMs) return;
        lastRef.current = now;

        const src = SOUND_FILES[Math.floor(Math.random() * SOUND_FILES.length)];

        const audio = new Audio(src);
        audio.volume = 0.3;
        audio.play().catch(() => { });

        if (isShort) {
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, 400);
        }
    }, [debounceMs]);

    const playSoundShort = useCallback(() => play(true), [play]);
    const playSoundFull = useCallback(() => play(false), [play]);

    return { playSoundShort, playSoundFull };
}
