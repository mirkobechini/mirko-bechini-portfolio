import { describe, it, expect } from 'vitest';
import contacts from '../features/modals/contacts/contactsData';

describe('contactsData', () => {
    it('exports an array of 3 contacts', () => {
        expect(Array.isArray(contacts)).toBe(true);
        expect(contacts).toHaveLength(3);
    });

    it('each contact has required fields', () => {
        contacts.forEach(c => {
            expect(c).toHaveProperty('id');
            expect(c).toHaveProperty('href');
            expect(c).toHaveProperty('icon');
            expect(c).toHaveProperty('label');
            expect(c).toHaveProperty('variantClass');
            expect(c).toHaveProperty('ariaLabel');
        });
    });

    it('has unique ids starting from 1', () => {
        const ids = contacts.map(c => c.id);
        expect(ids).toEqual([1, 2, 3]);
    });

    it('has email contact', () => {
        const email = contacts.find(c => c.label === 'Email');
        expect(email.href).toContain('mailto:');
    });

    it('has external links', () => {
        const external = contacts.filter(c => c.href.startsWith('http'));
        expect(external.length).toBe(2);
    });
});