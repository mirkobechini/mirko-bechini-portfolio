import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getProjects } from '../features/modals/projects/services/projectsApi';

const jsonResponse = (body, init = {}) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
    ...init,
});

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('getProjects', () => {
    it('chiama /api/projects chiedendo JSON e restituisce data', async () => {
        fetch.mockResolvedValue(jsonResponse({ data: [{ id: 'a' }] }));

        const result = await getProjects();

        expect(result).toEqual([{ id: 'a' }]);
        expect(fetch).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
            headers: { Accept: 'application/json' },
        }));
    });

    it('passa il signal per poter annullare la richiesta', async () => {
        fetch.mockResolvedValue(jsonResponse({ data: [] }));
        const controller = new AbortController();

        await getProjects(controller.signal);

        expect(fetch.mock.calls[0][1].signal).toBe(controller.signal);
    });

    it('lancia un errore se la risposta non è ok', async () => {
        fetch.mockResolvedValue(jsonResponse({}, { ok: false, status: 429, statusText: 'Too Many Requests' }));

        await expect(getProjects()).rejects.toThrow('429');
    });

    it('lancia un errore se il JSON non ha la forma attesa', async () => {
        fetch.mockResolvedValue(jsonResponse({ projects: [] }));

        await expect(getProjects()).rejects.toThrow('non valida');
    });

    it('propaga gli errori di rete', async () => {
        fetch.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(getProjects()).rejects.toThrow('Failed to fetch');
    });
});
