import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchList } from '../services/apiClient';

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchList', () => {
    it('chiede JSON e restituisce il contenuto di data', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [1, 2] }) });

        expect(await fetchList('/api/x')).toEqual([1, 2]);
        expect(fetch).toHaveBeenCalledWith('/api/x', expect.objectContaining({ headers: { Accept: 'application/json' } }));
    });

    it('lancia con stato e testo se la risposta non è ok', async () => {
        fetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });

        await expect(fetchList('/api/x')).rejects.toThrow('404 Not Found');
    });

    it('lancia se manca data o non è un array', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: 'no' }) });
        await expect(fetchList('/api/x')).rejects.toThrow('non valida');

        fetch.mockResolvedValue({ ok: true, json: async () => null });
        await expect(fetchList('/api/x')).rejects.toThrow('non valida');
    });
});
