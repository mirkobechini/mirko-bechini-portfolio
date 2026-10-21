import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useAbout from '../hooks/useAbout';
import { getAbout } from '../features/modals/about/aboutApi';
import aboutData from '../features/modals/about/aboutData';

vi.mock('../features/modals/about/aboutApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getAbout: vi.fn(),
}));

const CACHE_KEY = 'about_api_cache_v1'; // stessa chiave dell'hook

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useAbout', () => {
    it("carica il testo dall'API e lo salva in cache", async () => {
        const item = { title: 'Ciao', paragraphs: ['uno'] };
        getAbout.mockResolvedValue([item]);

        const { result } = renderHook(() => useAbout());

        expect(result.current.about).toBeNull();
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.about).toEqual(item);
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toEqual([item]);
    });

    it('con cache valida mostra subito il testo e lo ricontrolla in background', async () => {
        const cached = { title: 'In cache', paragraphs: ['x'] };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [cached], expiry: Date.now() + 60_000 }));
        getAbout.mockResolvedValue([{ title: 'Nuovo', paragraphs: ['y'] }]);

        const { result } = renderHook(() => useAbout());

        expect(result.current.about).toEqual(cached);
        expect(result.current.loading).toBe(false);
        await waitFor(() => expect(result.current.about.title).toBe('Nuovo'));
    });

    it("se l'API fallisce e non c'è cache usa aboutData.js", async () => {
        getAbout.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useAbout());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.about).toEqual(aboutData[0]);
        expect(result.current.error).toBeTruthy();
    });
});
