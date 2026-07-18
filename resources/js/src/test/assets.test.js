import { describe, it, expect } from 'vitest';
import { getAssetPath, ASSETS_PATH } from '../utils/assets';

describe('getAssetPath', () => {
    it('returns path with default /assets prefix', () => {
        expect(getAssetPath('/sprites/monkey.webp')).toBe('/assets/sprites/monkey.webp');
    });

    it('handles nested paths', () => {
        expect(getAssetPath('/modals/skills/icons/react.webp')).toBe('/assets/modals/skills/icons/react.webp');
    });

    it('works with .ogg audio files', () => {
        expect(getAssetPath('/sounds/contacts/parrot_click.ogg')).toBe('/assets/sounds/contacts/parrot_click.ogg');
    });

    it('handles empty path', () => {
        expect(getAssetPath('')).toBe('/assets');
    });
});

describe('ASSETS_PATH', () => {
    it('exports ASSETS_PATH with default value', () => {
        expect(ASSETS_PATH).toBe('/assets');
    });
});