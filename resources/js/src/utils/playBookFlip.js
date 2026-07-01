import { getAssetPath } from './assets';

const BOOK_FLIP_FILES = [
    getAssetPath('/sounds/library/book_flip.1.ogg'),
    getAssetPath('/sounds/library/book_flip.2.ogg'),
    getAssetPath('/sounds/library/book_flip.3.ogg'),
    getAssetPath('/sounds/library/book_flip.4.ogg'),
    getAssetPath('/sounds/library/book_flip.5.ogg'),
    getAssetPath('/sounds/library/book_flip.6.ogg'),
    getAssetPath('/sounds/library/book_flip.7.ogg'),
    getAssetPath('/sounds/library/book_flip.8.ogg'),
    getAssetPath('/sounds/library/book_flip.9.ogg'),
    getAssetPath('/sounds/library/book_flip.10.ogg'),
];

let lastPlayed = 0;
let audioEl = null;

/**
 * Play a random book flip sound with shared debounce (300ms).
 * Can be called from anywhere — uses module-level singleton Audio element.
 */
export default function playBookFlip() {
    const now = Date.now();
    if (now - lastPlayed < 300) return;
    lastPlayed = now;

    const src = BOOK_FLIP_FILES[Math.floor(Math.random() * BOOK_FLIP_FILES.length)];

    if (!audioEl) {
        audioEl = new Audio();
    }

    audioEl.src = src;
    audioEl.volume = 0.3;
    audioEl.play().catch(() => { });
}