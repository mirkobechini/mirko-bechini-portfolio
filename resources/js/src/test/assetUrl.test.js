import { describe, it, expect, vi } from 'vitest';
import { resolveAssetUrl } from '../utils/assetUrl';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

describe('resolveAssetUrl', () => {
    it('un percorso in public/assets riceve il prefisso', () => {
        expect(resolveAssetUrl('/modals/skills/icons/html.webp')).toBe('/assets/modals/skills/icons/html.webp');
    });

    it('un URL completo resta com\'è', () => {
        expect(resolveAssetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
        expect(resolveAssetUrl('http://localhost/storage/a.png')).toBe('http://localhost/storage/a.png');
    });

    it('un file del disco pubblico (/storage/...) resta com\'è', () => {
        expect(resolveAssetUrl('/storage/skills/icons/a.png')).toBe('/storage/skills/icons/a.png');
    });

    it('un valore vuoto o non testuale diventa null', () => {
        expect(resolveAssetUrl('')).toBeNull();
        expect(resolveAssetUrl(null)).toBeNull();
        expect(resolveAssetUrl(undefined)).toBeNull();
        expect(resolveAssetUrl(42)).toBeNull();
    });
});
