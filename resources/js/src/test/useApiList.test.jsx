import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useApiList from '../hooks/useApiList';

const CACHE_KEY = 'lista_di_prova_v1';
const ERROR = 'Impossibile caricare.';

const fetcher = vi.fn();
const loadFallback = vi.fn();
const mapper = (items) => items.map((item) => ({ ...item, mapped: true }));

const render = () => renderHook(() => useApiList({ cacheKey: CACHE_KEY, fetcher, mapper, loadFallback, errorMessage: ERROR }));

// expiryOffsetMs > 0 = dati freschi, < 0 = scaduti
function seedCache(data, expiryOffsetMs) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiry: Date.now() + expiryOffsetMs }));
}

const cachedItem = { id: 'cache', mapped: true };

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    loadFallback.mockResolvedValue([{ id: 'riserva' }]);
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useApiList: ricontrollo a ogni apertura', () => {
    it('con dati freschi li mostra subito, senza caricamento, e poi li aggiorna se sono cambiati', async () => {
        seedCache([cachedItem], 60_000);
        fetcher.mockResolvedValue([{ id: 'nuovo' }]);

        const { result } = render();

        expect(result.current.items).toEqual([cachedItem]);
        expect(result.current.loading).toBe(false);

        await waitFor(() => expect(result.current.items[0].id).toBe('nuovo'));
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data[0].id).toBe('nuovo');
        expect(result.current.error).toBeNull();
    });

    it('con dati freschi un errore di rete è silenzioso: si tengono i dati che si vedono', async () => {
        seedCache([cachedItem], 60_000);
        fetcher.mockRejectedValue(new Error('down'));

        const { result } = render();

        await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
        await act(async () => { });
        expect(result.current.items).toEqual([cachedItem]);
        expect(result.current.error).toBeNull();
        expect(loadFallback).not.toHaveBeenCalled();
    });

    it('con dati freschi una lista vuota dalla API non cancella quelli in memoria', async () => {
        seedCache([cachedItem], 60_000);
        fetcher.mockResolvedValue([]);

        const { result } = render();

        await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
        await act(async () => { });
        expect(result.current.items).toEqual([cachedItem]);
        expect(result.current.error).toBeNull();
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toEqual([cachedItem]);
    });
});

describe('useApiList: senza dati freschi', () => {
    it('senza nulla in memoria carica dalla API e salva in cache', async () => {
        fetcher.mockResolvedValue([{ id: 'a' }]);

        const { result } = render();

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.items).toEqual([{ id: 'a', mapped: true }]);
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(1);
    });

    it('con dati scaduti li mostra subito e, se la API fallisce, li tiene e segnala l\'errore', async () => {
        seedCache([cachedItem], -1000);
        fetcher.mockRejectedValue(new Error('down'));

        const { result } = render();

        expect(result.current.items).toEqual([cachedItem]);
        await waitFor(() => expect(result.current.error).toBe(ERROR));
        expect(result.current.items).toEqual([cachedItem]);
        expect(loadFallback).not.toHaveBeenCalled();
    });

    it('senza dati in memoria e con la API in errore usa i dati di riserva', async () => {
        fetcher.mockRejectedValue(new Error('down'));

        const { result } = render();

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.items).toEqual([{ id: 'riserva' }]);
        expect(result.current.error).toBe(ERROR);
    });

    it('se anche i dati di riserva falliscono restituisce una lista vuota', async () => {
        fetcher.mockRejectedValue(new Error('down'));
        loadFallback.mockRejectedValue(new Error('niente'));

        const { result } = render();

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.items).toEqual([]);
    });

    it('refetch riprova e azzera l\'errore', async () => {
        fetcher.mockRejectedValueOnce(new Error('down'));
        const { result } = render();
        await waitFor(() => expect(result.current.error).toBe(ERROR));

        fetcher.mockResolvedValue([{ id: 'ok' }]);
        await act(async () => {
            await result.current.refetch();
        });

        expect(result.current.error).toBeNull();
        expect(result.current.items[0].id).toBe('ok');
    });
});
