import { getAssetPath } from './assets';

const HOVER_SRC = getAssetPath('/sounds/contacts/parrot_hover.m4a');
const HOVER_FALLBACK = getAssetPath('/sounds/contacts/parrot_click.wav');
const CLICK_SRC = getAssetPath('/sounds/contacts/parrot_click.wav');

let lastHover = 0;
let lastClick = 0;

export function playParrotHover() {
    const now = Date.now();
    if (now - lastHover < 800) return;
    lastHover = now;

    const audio = new Audio();
    audio.volume = 0.3;

    // Prova il file m4a con fallback a wav
    audio.src = HOVER_SRC;
    audio.onerror = () => {
        console.warn('Parrot hover m4a failed, trying wav fallback');
        audio.src = HOVER_FALLBACK;
        audio.play().catch(() => {
            console.error('Parrot hover sound failed to play');
        });
    };

    audio.play().catch((err) => {
        // Se il play fallisce, prova il fallback
        console.warn('Parrot hover play failed:', err.message);
        audio.src = HOVER_FALLBACK;
        audio.play().catch(() => {
            console.error('Parrot hover fallback failed');
        });
    });

    // Limita la durata del suono a 500ms
    setTimeout(() => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, 500);
}

export function playParrotClick() {
    const now = Date.now();
    if (now - lastClick < 800) return;
    lastClick = now;

    const audio = new Audio(CLICK_SRC);
    audio.volume = 0.3;
    audio.play().catch(() => {
        console.error('Parrot click sound failed to play');
    });
}
