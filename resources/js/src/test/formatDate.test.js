import { describe, it, expect } from 'vitest';
import { formatLongDate } from '../utils/formatDate';

describe('formatLongDate', () => {
    it('scrive la data in italiano per esteso', () => {
        expect(formatLongDate('2026-10-12T10:00:00+00:00')).toBe('12 ottobre 2026');
        expect(formatLongDate('2025-01-05T08:30:00Z')).toBe('5 gennaio 2025');
    });

    it('usa il fuso di Roma: a mezzanotte e mezza italiana è già il giorno dopo', () => {
        expect(formatLongDate('2026-03-14T23:30:00Z')).toBe('15 marzo 2026');
    });

    it('restituisce null per valori mancanti o non validi', () => {
        expect(formatLongDate(null)).toBeNull();
        expect(formatLongDate(undefined)).toBeNull();
        expect(formatLongDate('')).toBeNull();
        expect(formatLongDate('non-una-data')).toBeNull();
        expect(formatLongDate(12345)).toBeNull();
    });
});
