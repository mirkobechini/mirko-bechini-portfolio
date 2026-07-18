import { describe, it, expect } from 'vitest';
import { isValidLink, isExternalWebLink } from '../utils/links';

describe('isValidLink', () => {
    it('returns true for a non-empty string', () => {
        expect(isValidLink('https://example.com')).toBe(true);
    });

    it('returns true for a relative path', () => {
        expect(isValidLink('/path/to/page')).toBe(true);
    });

    it('returns false for empty string', () => {
        expect(isValidLink('')).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
        expect(isValidLink('   ')).toBe(false);
    });

    it('returns false for "#"', () => {
        expect(isValidLink('#')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isValidLink(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isValidLink(undefined)).toBe(false);
    });

    it('returns false for a number', () => {
        expect(isValidLink(123)).toBe(false);
    });
});

describe('isExternalWebLink', () => {
    it('returns true for http links', () => {
        expect(isExternalWebLink('http://example.com')).toBe(true);
    });

    it('returns true for https links', () => {
        expect(isExternalWebLink('https://example.com')).toBe(true);
    });

    it('returns false for relative paths', () => {
        expect(isExternalWebLink('/path/to/page')).toBe(false);
    });

    it('returns false for mailto links', () => {
        expect(isExternalWebLink('mailto:test@example.com')).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(isExternalWebLink('')).toBe(false);
    });

    it('returns false for "#"', () => {
        expect(isExternalWebLink('#')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isExternalWebLink(null)).toBe(false);
    });
});