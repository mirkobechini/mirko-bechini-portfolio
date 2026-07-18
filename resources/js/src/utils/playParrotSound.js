import { getAssetPath } from './assets';
import { playPooled } from './audioPool';

const HOVER_SRC = getAssetPath('/sounds/contacts/parrot_hover.ogg');
const CLICK_SRC = getAssetPath('/sounds/contacts/parrot_click.ogg');

let lastHover = 0;
let lastClick = 0;

export function playParrotHover() {
    const now = Date.now();
    if (now - lastHover < 800) return;
    lastHover = now;

    playPooled(HOVER_SRC, { volume: 0.3, maxDuration: 500 });
}

export function playParrotClick() {
    const now = Date.now();
    if (now - lastClick < 800) return;
    lastClick = now;

    playPooled(CLICK_SRC, { volume: 0.3 });
}
