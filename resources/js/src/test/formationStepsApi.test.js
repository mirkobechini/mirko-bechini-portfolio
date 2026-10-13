import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getFormationSteps,
    mapApiFormationStep,
    mapApiFormationSteps,
    splitFormationSteps,
} from '../features/modals/library/formationStepsApi';

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const step = (id, kind, overrides = {}) => ({
    id,
    kind,
    title: `Passo ${id}`,
    description: 'd',
    status: 'next',
    badge: 'New Skill',
    ...overrides,
});

describe('getFormationSteps', () => {
    it('chiama /api/formation-steps e restituisce data', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [step(1, 'focus')] }) });

        expect(await getFormationSteps()).toHaveLength(1);
        expect(fetch.mock.calls[0][0]).toBe('/api/formation-steps');
    });
});

describe('mapApiFormationStep', () => {
    it("l'etichetta mancante diventa stringa vuota e il resto resta", () => {
        const result = mapApiFormationStep(step(1, 'focus', { badge: null }));

        expect(result.badge).toBe('');
        expect(result).toMatchObject({ id: 1, kind: 'focus', status: 'next' });
    });

    it("mapApiFormationSteps conserva l'ordine", () => {
        expect(mapApiFormationSteps([step(2, 'focus'), step(1, 'focus')]).map((s) => s.id)).toEqual([2, 1]);
    });
});

describe('splitFormationSteps', () => {
    it("separa focus e roadmap mantenendo l'ordine di ciascuna", () => {
        const result = splitFormationSteps([
            step(1, 'roadmap'),
            step(2, 'focus'),
            step(3, 'roadmap'),
            step(4, 'focus'),
        ]);

        expect(result.focus.map((s) => s.id)).toEqual([2, 4]);
        expect(result.roadmap.map((s) => s.id)).toEqual([1, 3]);
    });

    it('ignora le colonne sconosciute e gestisce la lista vuota', () => {
        expect(splitFormationSteps([step(1, 'altro')])).toEqual({ focus: [], roadmap: [] });
        expect(splitFormationSteps([])).toEqual({ focus: [], roadmap: [] });
    });
});
