import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playModalHover, playModalClick } from '../utils/modalSounds';
import { MODAL_IDS } from '../data/uiConstants';
import { playMonkeyHover, playMonkeyClick } from '../utils/playMonkeySound';
import { playParrotHover, playParrotClick } from '../utils/playParrotSound';

vi.mock('../utils/playMonkeySound', () => ({ playMonkeyHover: vi.fn(), playMonkeyClick: vi.fn() }));
vi.mock('../utils/playParrotSound', () => ({ playParrotHover: vi.fn(), playParrotClick: vi.fn() }));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('modalSounds', () => {
    it('About Me: hover e click suonano la scimmia', () => {
        playModalHover(MODAL_IDS.ABOUT_ME);
        playModalClick(MODAL_IDS.ABOUT_ME);

        expect(playMonkeyHover).toHaveBeenCalledTimes(1);
        expect(playMonkeyClick).toHaveBeenCalledTimes(1);
        expect(playParrotHover).not.toHaveBeenCalled();
        expect(playParrotClick).not.toHaveBeenCalled();
    });

    it('Contatti: hover e click suonano il pappagallo', () => {
        playModalHover(MODAL_IDS.CONTACTS);
        playModalClick(MODAL_IDS.CONTACTS);

        expect(playParrotHover).toHaveBeenCalledTimes(1);
        expect(playParrotClick).toHaveBeenCalledTimes(1);
        expect(playMonkeyHover).not.toHaveBeenCalled();
        expect(playMonkeyClick).not.toHaveBeenCalled();
    });

    it.each([MODAL_IDS.BOOKSHELF, MODAL_IDS.PROJECTS, MODAL_IDS.CERTIFICATIONS, 999])(
        'la modal %s non ha suoni e non lancia',
        (id) => {
            expect(() => {
                playModalHover(id);
                playModalClick(id);
            }).not.toThrow();

            expect(playMonkeyHover).not.toHaveBeenCalled();
            expect(playParrotHover).not.toHaveBeenCalled();
        }
    );
});
