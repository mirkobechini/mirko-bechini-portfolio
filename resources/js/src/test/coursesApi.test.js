import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCourses, mapApiCourse, mapApiCourses, sortCoursesByRecency } from '../features/modals/library/coursesApi';

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

describe('sortCoursesByRecency', () => {
    const course = (id, period) => ({ id, period });

    it('mette prima il corso iniziato più di recente', () => {
        const sorted = sortCoursesByRecency([
            course(1, '05/2025 - 02/2026'),
            course(2, '03/2026 - 03/2026'),
            course(4, '05/2026 - current'),
            course(3, '03/2026 - current'),
        ]);

        expect(sorted.map((c) => c.id)).toEqual([4, 3, 2, 1]);
    });

    it('a parità di inizio viene prima quello con id maggiore', () => {
        expect(sortCoursesByRecency([course(2, '03/2026'), course(3, '03/2026')]).map((c) => c.id)).toEqual([3, 2]);
    });

    it('legge anche il solo anno, e i periodi illeggibili vanno in fondo', () => {
        const sorted = sortCoursesByRecency([course(1, 'da definire'), course(2, '2024'), course(3, '13/2030'), course(4, '06/2024')]);

        expect(sorted.map((c) => c.id)).toEqual([4, 2, 3, 1]);
    });

    it('non modifica l\'array originale', () => {
        const original = [course(1, '01/2020'), course(2, '01/2021')];

        sortCoursesByRecency(original);

        expect(original.map((c) => c.id)).toEqual([1, 2]);
    });
});
