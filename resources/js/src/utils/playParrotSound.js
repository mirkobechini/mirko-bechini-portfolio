import { getAssetPath } from './assets';

const HOVER_SRC = getAssetPath('/sounds/contacts/parrot_hover.m4a');
const CLICK_SRC = getAssetPath('/sounds/contacts/parrot_click.wav');

let lastHover = 0;
let lastClick = 0;

export function playParrotHover() {
    const now = Date.now();
    if (now - lastHover < 800) return;
    lastHover = now;

    const audio = new Audio(HOVER_SRC);
    audio.volume = 0.3;
    audio.play().catch(() => { });
}

export function playParrotClick() {
    const now = Date.now();
    if (now - lastClick < 800) return;
    lastClick = now;

    const audio = new Audio(CLICK_SRC);
    audio.volume = 0.3;
    audio.play().catch(() => { });
}
