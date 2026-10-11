import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRepos } from '../features/modals/projects/services/githubApi';

// fetch non esiste come mock: lo sostituiamo con un finto controllabile
const fetchMock = vi.fn();

// Costruisce una risposta finta di fetch
function jsonResponse(body, { ok = true, status = 200, statusText = 'OK' } = {}) {
    return { ok, status, statusText, json: async () => body };
}

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('getRepos', () => {
    // 1. L'URL e gli header sono quelli attesi
    it('chiama l\'endpoint GitHub dell\'utente con gli header corretti', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));

        await getRepos();

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toContain('https://api.github.com/users/mirkobechini/repos');
        expect(url).toContain('per_page=100');
        expect(options.headers.Accept).toBe('application/vnd.github.v3+json');
    });

    // 2. Filtra fork e archiviati
    it('esclude fork e repo archiviati', async () => {
        fetchMock.mockResolvedValue(jsonResponse([
            { name: 'ok', fork: false, archived: false },
            { name: 'f', fork: true, archived: false },
            { name: 'a', fork: false, archived: true }
        ]));

        const result = await getRepos();

        expect(result.map(r => r.name)).toEqual(['ok']);
    });

    // 3. Risposta non-OK
    it('lancia un errore se la risposta non è ok', async () => {
        fetchMock.mockResolvedValue(jsonResponse(null, { ok: false, status: 403, statusText: 'rate limit exceeded' }));

        await expect(getRepos()).rejects.toThrow('403');
    });

    // 4. Errore di rete
    it('propaga l\'errore di rete di fetch', async () => {
        fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

        await expect(getRepos()).rejects.toThrow('Failed to fetch');
    });

    // 5. Lista vuota
    it('restituisce un array vuoto se GitHub non ha repo', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));

        const result = await getRepos();

        expect(result).toEqual([]);
    });
});
