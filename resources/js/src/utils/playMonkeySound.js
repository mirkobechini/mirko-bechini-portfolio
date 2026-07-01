import { getAssetPath } from './assets';

const SOUND_FILES = [
    getAssetPath('/sounds/about/monkey-1.ogg'),
    getAssetPath('/sounds/about/monkey-2.ogg'),
    getAssetPath('/sounds/about/monkey-3.ogg'),
];

let lastHover = 0;
let lastClick = 0;

export function playMonkeyHover() {
    const now = Date.now();
    if (now - lastHover < 800) return;
    lastHover = now;

    const src = SOUND_FILES[Math.floor(Math.random() * SOUND_FILES.length)];
    const audio = new Audio(src);
    audio.volume = 0.3;
    audio.play().catch(() => { });

    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 400);
}

export function playMonkeyClick() {
    const now = Date.now();
    if (now - lastClick < 800) return;
    lastClick = now;

    const src = SOUND_FILES[Math.floor(Math.random() * SOUND_FILES.length)];
    const audio = new Audio(src);
    audio.volume = 0.3;
    audio.play().catch(() => { });
}
