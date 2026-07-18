import { getAssetPath } from './assets';

const PAGE_TURN_SRC = getAssetPath('/sounds/library/page-turn.ogg');

let lastPlayed = 0;

/**
 * Play a page turn sound with shared debounce (300ms).
 * Crea un nuovo Audio ad ogni chiamata per evitare conflitti di stato.
 */
export default function playBookFlip() {
    const now = Date.now();
    if (now - lastPlayed < 300) return;
    lastPlayed = now;

    const audio = new Audio(PAGE_TURN_SRC);
    audio.volume = 0.3;
    audio.play().catch(() => { });
}