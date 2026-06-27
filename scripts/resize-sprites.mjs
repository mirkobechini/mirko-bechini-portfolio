/**
 * Generates responsive variants of homepage sprite images.
 * Creates -sm (50%) and -md (75%) scaled versions alongside the original.
 *
 * Usage: node scripts/resize-sprites.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SPRITES_DIR = path.resolve('public/assets/sprites');
const VARIANTS = [
    { suffix: '-sm', scale: 0.5 },
    { suffix: '-md', scale: 0.75 },
];

const files = fs.readdirSync(SPRITES_DIR).filter(f => f.endsWith('.webp'));

async function main() {
    for (const file of files) {
        const filePath = path.join(SPRITES_DIR, file);
        const basename = path.basename(file, '.webp');

        const meta = await sharp(filePath).metadata();
        console.log(`\n${file} (${meta.width}×${meta.height})`);

        for (const variant of VARIANTS) {
            const newWidth = Math.round(meta.width * variant.scale);
            const outName = `${basename}${variant.suffix}.webp`;
            const outPath = path.join(SPRITES_DIR, outName);

            if (fs.existsSync(outPath)) {
                console.log(`  ${outName} — già esistente, salto`);
                continue;
            }

            await sharp(filePath)
                .resize({ width: newWidth, withoutEnlargement: true })
                .webp({ quality: 85, smartSubsample: true })
                .toFile(outPath);

            const outMeta = await sharp(outPath).metadata();
            const savings = ((1 - outMeta.size / meta.size) * 100).toFixed(1);
            console.log(`  ${outName} → ${newWidth}w, ${(outMeta.size / 1024).toFixed(1)} kB (${savings}% vs originale)`);
        }
    }

    console.log('\n✅ Fatto!');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});