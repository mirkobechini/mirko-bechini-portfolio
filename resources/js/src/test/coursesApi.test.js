import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCourses, mapApiCourse, mapApiCourses } from '../features/modals/library/coursesApi';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const apiCourse = (overrides = {}) => ({
    id: 1,
    course: 'LEARN REACT',
    description: 'Corso',
    certificate: '/modals/certifications/react.webp',
    organization: 'Scrimba',
    organizationUrl: 'https://scrimba.com',
    period: '03/2026 - 03/2026',
    skills: ['React'],
    highlights: ['Hooks'],
    modules: [{ title: 'Basics', description: 'JSX', skillsModules: ['React'] }],
    projects: ['Tenzies'],
    ...overrides,
});

describe('getCourses', () => {
    it('chiama /api/education e restituisce data', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [apiCourse()] }) });

        expect(await getCourses()).toHaveLength(1);
        expect(fetch.mock.calls[0][0]).toBe('/api/education');
    });
});

describe('mapApiCourse', () => {
    it("un attestato locale riceve il prefisso degli asset", () => {
        expect(mapApiCourse(apiCourse()).certificate).toBe('/assets/modals/certifications/react.webp');
    });

    it('un attestato con URL esterno resta com\'è', () => {
        const url = 'https://cdn.example.com/cert.png';

        expect(mapApiCourse(apiCourse({ certificate: url })).certificate).toBe(url);
    });

    it('senza attestato resta stringa vuota', () => {
        expect(mapApiCourse(apiCourse({ certificate: '' })).certificate).toBe('');
        expect(mapApiCourse(apiCourse({ certificate: null })).certificate).toBe('');
    });

    it('applica valori di sicurezza a liste e moduli mancanti', () => {
        const result = mapApiCourse(apiCourse({
            skills: null,
            highlights: undefined,
            modules: [{ title: 'Senza skill', description: '' }],
        }));

        expect(result.skills).toEqual([]);
        expect(result.highlights).toEqual([]);
        expect(result.modules[0].skillsModules).toEqual([]);
    });

    it('mantiene gli altri campi e l\'ordine', () => {
        const result = mapApiCourses([apiCourse({ id: 2 }), apiCourse({ id: 1 })]);

        expect(result.map((c) => c.id)).toEqual([2, 1]);
        expect(result[0]).toMatchObject({ course: 'LEARN REACT', organization: 'Scrimba', projects: ['Tenzies'] });
    });
});
