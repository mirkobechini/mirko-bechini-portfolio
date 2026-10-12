import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getContacts, mapApiContacts } from '../features/modals/contacts/contactsApi';

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const contact = (href, overrides = {}) => ({
    id: 1,
    href,
    icon: '🔗',
    label: 'X',
    variantClass: 'other',
    ariaLabel: 'X',
    ...overrides,
});

describe('getContacts', () => {
    it('chiama /api/contacts e restituisce data', async () => {
        fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [contact('https://a.it')] }) });

        expect(await getContacts()).toHaveLength(1);
        expect(fetch.mock.calls[0][0]).toBe('/api/contacts');
    });
});

describe('mapApiContacts', () => {
    it('tiene https, http, mailto e tel', () => {
        const input = ['https://a.it', 'http://a.it', 'mailto:a@b.it', 'tel:+39123'].map((href, i) => contact(href, { id: i }));

        expect(mapApiContacts(input)).toHaveLength(4);
    });

    it('scarta gli schemi pericolosi o malformati', () => {
        const input = ['javascript:alert(1)', 'data:text/html,hi', 'ftp://a.it', '//a.it', 'a.it', 'https://', '', null, 42]
            .map((href, i) => contact(href, { id: i }));

        expect(mapApiContacts(input)).toEqual([]);
    });

    it("conserva l'ordine e i campi", () => {
        const input = [contact('https://b.it', { id: 2 }), contact('https://a.it', { id: 1 })];

        expect(mapApiContacts(input)).toEqual(input);
    });
});
