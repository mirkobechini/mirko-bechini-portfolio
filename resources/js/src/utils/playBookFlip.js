import { getAssetPath } from './assets';
import { playPooled } from './audioPool';

const PAGE_TURN_SRC = getAssetPath('/sounds/library/page-turn.ogg');

let lastPlayed = 0;

/**
 * Play a page turn sound with shared debounce (300ms).
 * Utilizza l'audio pool per riutilizzare elementi Audio.
 */
export default function playBookFlip() {
    const now = Date.now();
    if (now - lastPlayed < 300) return;
    lastPlayed = now;

    playPooled(PAGE_TURN_SRC, { volume: 0.3 });
}