import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Tutti i CSS dell'app (cartella src) letti come testo
const srcDir = join(process.cwd(), 'resources', 'js', 'src'); // i test partono dalla root del progetto
const cssFiles = Object.fromEntries(
    readdirSync(srcDir, { recursive: true })
        .filter((file) => String(file).endsWith('.css'))
        .map((file) => [String(file).replaceAll('\\', '/'), readFileSync(join(srcDir, String(file)), 'utf-8')])
);

const KEYWORDS = new Set([
    'none', 'infinite', 'forwards', 'backwards', 'both', 'normal', 'reverse', 'alternate',
    'alternate-reverse', 'paused', 'running', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
    'step-start', 'step-end',
]);

function animationNames(css) {
    const names = new Set();
    for (const match of css.matchAll(/^\s*animation(?:-name)?\s*:\s*([^;]+);/gm)) {
        // il nome è il primo token che non è una durata, una funzione o una parola chiave
        const tokens = match[1].replace(/\([^)]*\)/g, '').trim().split(/\s+/);
        const name = tokens.find((t) => !KEYWORDS.has(t) && !/^[\d.]+m?s$/.test(t) && !/^[\d.]+$/.test(t));
        if (name) names.add(name);
    }
    return names;
}

describe('CSS: nomi delle animazioni', () => {
    it('trova i file CSS da controllare', () => {
        expect(Object.keys(cssFiles).length).toBeGreaterThan(5);
    });

    it.each(Object.entries(cssFiles))('%s: ogni animation ha il suo @keyframes', (file, css) => {
        const keyframes = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
        const missing = [...animationNames(css)].filter((name) => !keyframes.has(name));

        // nei CSS modules "deskSlideIn" e "desk-slide-in" diventano nomi diversi: l'animazione non parte
        expect(missing).toEqual([]);
    });
});
