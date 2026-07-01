import { useCallback, useRef } from 'react';
import { getAssetPath } from '../utils/assets';

const SOUND_FILES = [
    getAssetPath('/sounds/monkey-1.ogg'),
    getAssetPath('/sounds/monkey-2.ogg'),
    getAssetPath('/sounds/monkey-3.ogg'),
];

/**
 * Hook that provides functions to play monkey sounds with debounce.
 * @param {number} debounceMs - Minimum interval between sounds in ms (default: 800)
 * @returns {{ playSoundShort: () => void, playSoundFull: () => void }}
 */
export default function useSound(debounceMs = 800) {
    const lastHoverRef = useRef(0);
    const lastClickRef = useRef(0);
    const audioRef = useRef(null);

    const play = useCallback((isShort) => {
        const now = Date.now();
        const lastRef = isShort ? lastHoverRef : lastClickRef;

        if (now - lastRef.current < debounceMs) return;
        lastRef.current = now;

        const randomIndex = Math.floor(Math.random() * SOUND_FILES.length);
        const soundSrc = SOUND_FILES[randomIndex];

        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        audioRef.current.src = soundSrc;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => { });

        if (isShort) {
            clearTimeout(audioRef.current._shortTimer);
            audioRef.current._shortTimer = setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            }, 400);
        }
    }, [debounceMs]);

    const playSoundShort = useCallback(() => play(true), [play]);
    const playSoundFull = useCallback(() => play(false), [play]);

    return { playSoundShort, playSoundFull };
}
