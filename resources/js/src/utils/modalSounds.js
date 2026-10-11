import { MODAL_IDS } from '../data/uiConstants';
import { playMonkeyHover, playMonkeyClick } from './playMonkeySound';
import { playParrotHover, playParrotClick } from './playParrotSound';

/**
 * Registry dei suoni per modal: per aggiungere un suono a un'altra modal
 * basta una riga qui, senza toccare HomePage.
 */
const MODAL_SOUNDS = {
    [MODAL_IDS.ABOUT_ME]: { hover: playMonkeyHover, click: playMonkeyClick },
    [MODAL_IDS.CONTACTS]: { hover: playParrotHover, click: playParrotClick },
};

export function playModalHover(id) {
    MODAL_SOUNDS[id]?.hover?.();
}

export function playModalClick(id) {
    MODAL_SOUNDS[id]?.click?.();
}
