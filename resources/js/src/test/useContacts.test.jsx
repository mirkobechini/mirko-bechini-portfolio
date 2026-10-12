import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useContacts from '../hooks/useContacts';
import { getContacts } from '../features/modals/contacts/contactsApi';
import contactsData from '../features/modals/contacts/contactsData';

vi.mock('../features/modals/contacts/contactsApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getContacts: vi.fn(),
}));

const CACHE_KEY = 'contacts_api_cache_v1'; // stessa chiave dell'hook

const apiContact = { id: 5, href: 'https://a.it', icon: '🔗', label: 'A', variantClass: 'other', ariaLabel: 'A' };

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useContacts', () => {
    it("carica i contatti dall'API e li salva in cache", async () => {
        getContacts.mockResolvedValue([apiContact]);

        const { result } = renderHook(() => useContacts());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.contacts).toEqual([apiContact]);
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(1);
    });

    it("scarta dall'API i contatti con indirizzo non sicuro", async () => {
        getContacts.mockResolvedValue([apiContact, { ...apiContact, id: 6, href: 'javascript:alert(1)' }]);

        const { result } = renderHook(() => useContacts());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.contacts.map((c) => c.id)).toEqual([5]);
    });

    it("con cache valida non chiama l'API", async () => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [{ ...apiContact, label: 'Cache' }], expiry: Date.now() + 60_000 }));

        const { result } = renderHook(() => useContacts());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.contacts[0].label).toBe('Cache');
        expect(getContacts).not.toHaveBeenCalled();
    });

    it("se l'API fallisce e non c'è cache usa contactsData.js", async () => {
        getContacts.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useContacts());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.contacts).toEqual(contactsData);
        expect(result.current.error).toBe('Impossibile caricare i contatti.');
    });
});
