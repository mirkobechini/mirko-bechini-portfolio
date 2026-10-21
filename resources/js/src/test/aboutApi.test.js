import { describe, it, expect } from 'vitest';
import { mapApiAbout } from '../features/modals/about/aboutApi';

describe('mapApiAbout', () => {
    it('lascia passare un testo valido', () => {
        const item = { title: 'Ciao', paragraphs: ['uno', 'due'] };
        expect(mapApiAbout([item])).toEqual([item]);
    });

    it('scarta gli elementi malformati', () => {
        expect(mapApiAbout([null, {}, { title: 5, paragraphs: [] }, { title: 'x', paragraphs: 'no' }])).toEqual([]);
    });

    it('toglie i paragrafi vuoti o non testuali', () => {
        expect(mapApiAbout([{ title: 'T', paragraphs: ['a', '', '  ', 3, 'b'] }])).toEqual([{ title: 'T', paragraphs: ['a', 'b'] }]);
    });

    it('scarta un testo senza titolo né paragrafi', () => {
        expect(mapApiAbout([{ title: ' ', paragraphs: [] }])).toEqual([]);
    });
});
