import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSkills, mapApiSkill, mapApiSkills } from '../features/modals/library/skillsApi';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const apiSkill = (overrides = {}) => ({
    id: 1,
    skill: 'HTML',
    icon: '/modals/skills/icons/html.webp',
    category: 'Mark-up',
    color: '#E34F26',
    functions: ['Pagine semantiche'],
    relatedProjects: ['Portfolio personale'],
    ...overrides,
});

describe('getSkills', () => {
    it('chiama /api/skills e restituisce data', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [apiSkill()] }) });

        const result = await getSkills();

        expect(result).toHaveLength(1);
        expect(fetch.mock.calls[0][0]).toBe('/api/skills');
    });

    it('lancia un errore se la risposta non è ok', async () => {
        fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });

        await expect(getSkills()).rejects.toThrow('500');
    });
});

describe('mapApiSkill', () => {
    it("trasforma il percorso dell'icona in URL degli asset e mantiene il resto", () => {
        const result = mapApiSkill(apiSkill());

        expect(result.icon).toBe('/assets/modals/skills/icons/html.webp');
        expect(result).toMatchObject({ id: 1, skill: 'HTML', category: 'Mark-up', color: '#E34F26' });
    });

    it('senza icona resta null, senza liste diventano vuote', () => {
        const result = mapApiSkill(apiSkill({ icon: null, functions: null, relatedProjects: undefined }));

        expect(result.icon).toBeNull();
        expect(result.functions).toEqual([]);
        expect(result.relatedProjects).toEqual([]);
    });

    it("mapApiSkills conserva l'ordine", () => {
        const result = mapApiSkills([apiSkill({ id: 2 }), apiSkill({ id: 1 })]);

        expect(result.map((s) => s.id)).toEqual([2, 1]);
    });
});
