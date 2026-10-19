import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCertifications, mapApiCertification, mapApiCertifications } from '../features/modals/certifications/certificationsApi';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const apiCertification = (overrides = {}) => ({
    id: 1,
    title: 'Attestato',
    preview: '/modals/certifications/react.webp',
    previewWidth: 1320,
    previewHeight: 840,
    link: null,
    organization: 'Scrimba',
    organizationUrl: 'https://scrimba.com',
    skills: ['React'],
    courseId: 2,
    ...overrides,
});

describe('getCertifications', () => {
    it('chiama /api/certifications e restituisce data', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [apiCertification()] }) });

        expect(await getCertifications()).toHaveLength(1);
        expect(fetch.mock.calls[0][0]).toBe('/api/certifications');
    });
});

describe('mapApiCertification', () => {
    it("un'immagine locale riceve il prefisso degli asset", () => {
        expect(mapApiCertification(apiCertification()).preview).toBe('/assets/modals/certifications/react.webp');
    });

    it("un'immagine con URL esterno resta com'è", () => {
        const url = 'https://cdn.example.com/cert.png';

        expect(mapApiCertification(apiCertification({ preview: url })).preview).toBe(url);
    });

    it('applica valori di sicurezza e mantiene courseId e il resto', () => {
        const result = mapApiCertification(apiCertification({ skills: null }));

        expect(result.skills).toEqual([]);
        expect(result).toMatchObject({ courseId: 2, title: 'Attestato', previewWidth: 1320 });
    });

    it('mapApiCertifications scarta gli attestati senza immagine', () => {
        const result = mapApiCertifications([
            apiCertification({ id: 1, preview: null }),
            apiCertification({ id: 2, preview: '' }),
            apiCertification({ id: 3 }),
            apiCertification({ id: 4, preview: undefined }),
        ]);

        expect(result.map((c) => c.id)).toEqual([3]);
    });

    it("mapApiCertifications conserva l'ordine", () => {
        const result = mapApiCertifications([apiCertification({ id: 2 }), apiCertification({ id: 1 })]);

        expect(result.map((c) => c.id)).toEqual([2, 1]);
    });
});
