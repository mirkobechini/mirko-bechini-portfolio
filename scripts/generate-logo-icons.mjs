/**
 * Genera tutte le icone del sito dal logo (public/favicon.svg, lo stesso file usato come favicon SVG).
 *
 * Uso:  node scripts/generate-logo-icons.mjs [cartella-di-uscita]
 * Senza argomento scrive dentro public/ (icone in public/icons, favicon.ico in public/).
 *
 * Prodotti:
 *  - public/icons/pwa-<n>x<n>.png    icone "any" (logo su sfondo trasparente, con un piccolo margine)
 *  - public/icons/pwa-maskable-512x512.png  icona "maskable" di Android (sfondo pieno, logo nella zona sicura)
 *  - public/icons/apple-touch-icon.png      180x180, sfondo pieno (iOS non accetta la trasparenza)
 *  - public/favicon.ico              16, 32 e 48 px (PNG dentro un contenitore ICO)
 */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const source = path.join(publicDir, 'favicon.svg');

const outRoot = process.argv[2] ? path.resolve(process.argv[2]) : publicDir;
const iconsDir = path.join(outRoot, 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Stesso colore di theme_color / background_color del manifest (vite.config.js)
const BACKGROUND = { r: 26, g: 26, b: 26, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * Il logo ridimensionato in un quadrato `size`, centrato, con un margine (frazione del lato) su ogni lato.
 */
async function logoOn(size, { margin, background }) {
    const inner = Math.round(size * (1 - 2 * margin));
    // density alta: l'SVG si rasterizza già alla misura giusta, senza sgranare
    const logo = await sharp(source, { density: Math.max(72, Math.round((inner / 376) * 72 * 2)) })
        .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
        .png()
        .toBuffer();

    return sharp({ create: { width: size, height: size, channels: 4, background } })
        .composite([{ input: logo, gravity: 'center' }])
        .png({ compressionLevel: 9 })
        .toBuffer();
}

const written = [];
async function save(file, buffer) {
    fs.writeFileSync(file, buffer);
    written.push(`${path.relative(outRoot, file)} (${buffer.length} byte)`);
}

// Icone "any" del manifest: trasparenti, margine del 6%
for (const size of [48, 72, 96, 128, 144, 152, 192, 512]) {
    await save(path.join(iconsDir, `pwa-${size}x${size}.png`), await logoOn(size, { margin: 0.06, background: TRANSPARENT }));
}

// Maskable: Android ritaglia fino a un cerchio di diametro 80% del lato: il logo sta dentro il 62% centrale
await save(path.join(iconsDir, 'pwa-maskable-512x512.png'), await logoOn(512, { margin: 0.19, background: BACKGROUND }));

// iOS: sfondo pieno, margine del 14% (iOS arrotonda gli angoli da solo)
await save(path.join(iconsDir, 'apple-touch-icon.png'), await logoOn(180, { margin: 0.14, background: BACKGROUND }));

// favicon.ico: contenitore ICO con tre PNG (16, 32, 48), margine minimo per leggere il logo anche piccolo
const icoSizes = [16, 32, 48];
const pngs = [];
for (const size of icoSizes) {
    pngs.push(await logoOn(size, { margin: 0.02, background: TRANSPARENT }));
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // riservato
header.writeUInt16LE(1, 2); // tipo: icona
header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const entries = icoSizes.map((size, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // larghezza
    entry.writeUInt8(size, 1); // altezza
    entry.writeUInt8(0, 2); // colori nella tavolozza
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4); // piani
    entry.writeUInt16LE(32, 6); // bit per pixel
    entry.writeUInt32LE(pngs[i].length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return entry;
});
await save(path.join(outRoot, 'favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));

console.log(written.join('\n'));
console.log(`\n✅ ${written.length} file scritti in ${outRoot}`);
