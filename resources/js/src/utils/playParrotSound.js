import { getAssetPath } from './assets';

const HOVER_SRC = getAssetPath('/sounds/contacts/parrot_hover.ogg');
const CLICK_SRC = getAssetPath('/sounds/contacts/parrot_click.ogg');

let lastHover = 0;
let lastClick = 0;

function playAudio(src, maxDuration = 0) {
    const audio = new Audio(src);
    audio.volume = 0.3;
    audio.play().catch(() => { });

    if (maxDuration > 0) {
        setTimeout(() => {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        }, maxDuration);
    }
}

export function playParrotHover() {
    const now = Date.now();
    if (now - lastHover < 800) return;
    lastHover = now;

    playAudio(HOVER_SRC, 500);
}

export function playParrotClick() {
    const now = Date.now();
    if (now - lastClick < 800) return;
    lastClick = now;

    playAudio(CLICK_SRC);
}
