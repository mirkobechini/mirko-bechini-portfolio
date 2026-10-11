import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../hooks/useLocalStorage';

const KEY = 'test_key';

beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useLocalStorage', () => {
    it('restituisce null se la chiave non esiste', () => {
        const { result } = renderHook(() => useLocalStorage(KEY));

        expect(result.current.get()).toBeNull();
    });

    it('salva e rilegge i dati con una scadenza futura', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, 1000));

        act(() => {
            result.current.set({ a: 1 });
        });

        expect(result.current.get()).toEqual({ a: 1 });

        const stored = JSON.parse(localStorage.getItem(KEY));
        expect(stored.data).toEqual({ a: 1 });
        expect(stored.expiry).toBeGreaterThan(Date.now());
    });

    it('con dato scaduto get() è null ma getStale() restituisce ancora i dati', () => {
        localStorage.setItem(KEY, JSON.stringify({ data: { a: 1 }, expiry: Date.now() - 1000 }));

        const { result } = renderHook(() => useLocalStorage(KEY));

        expect(result.current.get()).toBeNull();
        expect(result.current.getStale()).toEqual({ a: 1 });
    });

    it('con JSON corrotto non lancia e restituisce null', () => {
        localStorage.setItem(KEY, '{non-json');

        const { result } = renderHook(() => useLocalStorage(KEY));

        expect(result.current.get()).toBeNull();
    });

    it('se localStorage.setItem lancia, set() non lancia e i dati restano in memoria', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });
        const { result } = renderHook(() => useLocalStorage(KEY));

        expect(() => {
            act(() => {
                result.current.set({ a: 1 });
            });
        }).not.toThrow();

        expect(result.current.get()).toEqual({ a: 1 });
    });

    it('remove() cancella la chiave e azzera i dati', () => {
        const { result } = renderHook(() => useLocalStorage(KEY));

        act(() => {
            result.current.set({ a: 1 });
        });
        act(() => {
            result.current.remove();
        });

        expect(result.current.get()).toBeNull();
        expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('con JSON corrotto e removeItem che lancia non va in crash', () => {
        localStorage.setItem(KEY, '{non-json');
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new Error('storage non disponibile');
        });

        const { result } = renderHook(() => useLocalStorage(KEY));

        expect(result.current.get()).toBeNull();
    });

    it('remove() non va in crash se removeItem lancia e azzera comunque i dati in memoria', () => {
        const { result } = renderHook(() => useLocalStorage(KEY));
        act(() => {
            result.current.set({ a: 1 });
        });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new Error('storage non disponibile');
        });

        expect(() => {
            act(() => {
                result.current.remove();
            });
        }).not.toThrow();

        expect(result.current.get()).toBeNull();
    });

    it('un dato senza scadenza non risulta mai scaduto', () => {
        localStorage.setItem(KEY, JSON.stringify({ data: { a: 1 } }));

        const { result } = renderHook(() => useLocalStorage(KEY));

        expect(result.current.get()).toEqual({ a: 1 });
    });
});
