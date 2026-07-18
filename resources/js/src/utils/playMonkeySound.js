import { getAssetPath } from './assets';
import { playPooled } from './audioPool';

const SOUND_FILES = [
    getAssetPath('/sounds/about/monkey-1.ogg'),
    getAssetPath('/sounds/about/monkey-2.ogg'),
    getAssetPath('/sounds/about/monkey-3.ogg'),
];

let lastHover = 0;
let lastClick = 0;

function randomSound() {
    return SOUND_FILES[Math.floor(Math.random() * SOUND_FILES.length)];
}

export function playMonkeyHover() {
    const now = Date.now();
    if (now - lastHover < 800) return;
    lastHover = now;

    playPooled(randomSound(), { volume: 0.3, maxDuration: 400 });
}

export function playMonkeyClick() {
    const now = Date.now();
    if (now - lastClick < 800) return;
    lastClick = now;

    playPooled(randomSound(), { volume: 0.3 });
}
