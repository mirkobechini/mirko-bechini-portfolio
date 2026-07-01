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
 * @returns {{ playRandomSound: () => void }}
 */
export default function useSound(debounceMs = 800) {
    const lastPlayedRef = useRef(0);
    const audioRef = useRef(null);

    const playRandomSound = useCallback(() => {
        const now = Date.now();
        if (now - lastPlayedRef.current < debounceMs) return;

        lastPlayedRef.current = now;

        // Pick a random sound
        const randomIndex = Math.floor(Math.random() * SOUND_FILES.length);
        const soundSrc = SOUND_FILES[randomIndex];

        // Reuse or create Audio element
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        audioRef.current.src = soundSrc;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => {
            // Autoplay might be blocked, silently ignore
        });
    }, [debounceMs]);

    return { playRandomSound };
}
