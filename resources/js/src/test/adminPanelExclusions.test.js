import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd(); // i test partono dalla root del progetto
const read = (file) => readFileSync(join(root, file), 'utf-8');

describe('il pannello /admin convive con il portfolio', () => {
    it('il service worker non risponde con la home alle navigazioni verso /admin', () => {
        // navigateFallback: '/' darebbe la home in cache anche a /admin
        // (chi ha la PWA installata non vedrebbe il pannello, ma il portfolio)
        const config = read('vite.config.js');

        expect(config).toContain("navigateFallback: '/'");
        expect(config).toContain('navigateFallbackDenylist: [/^\\/admin/]');
    });

    it('robots.txt chiede ai motori di ricerca di non indicizzare /admin', () => {
        expect(read('public/robots.txt')).toMatch(/^Disallow:\s*\/admin\s*$/m);
    });
});
