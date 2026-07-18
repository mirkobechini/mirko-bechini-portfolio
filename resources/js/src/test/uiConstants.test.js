import { describe, it, expect } from 'vitest';
import { DRAG_SENSITIVITY, DRAG_THRESHOLD, MODAL_IDS } from '../data/uiConstants';

describe('uiConstants', () => {
    it('exports DRAG_SENSITIVITY', () => {
        expect(DRAG_SENSITIVITY).toBe(2);
    });

    it('exports DRAG_THRESHOLD', () => {
        expect(DRAG_THRESHOLD).toBe(5);
    });

    describe('MODAL_IDS', () => {
        it('has all expected modal IDs', () => {
            expect(MODAL_IDS.ABOUT_ME).toBe(1);
            expect(MODAL_IDS.BOOKSHELF).toBe(2);
            expect(MODAL_IDS.PROJECTS).toBe(3);
            expect(MODAL_IDS.CERTIFICATIONS).toBe(4);
            expect(MODAL_IDS.CONTACTS).toBe(5);
        });

        it('has unique IDs', () => {
            const ids = Object.values(MODAL_IDS);
            const unique = new Set(ids);
            expect(unique.size).toBe(ids.length);
        });
    });
});