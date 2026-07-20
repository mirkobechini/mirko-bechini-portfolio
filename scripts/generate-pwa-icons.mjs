import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../public/assets');
const outputDir = path.resolve(__dirname, '../public/icons');

const src = path.join(assetsDir, 'sprites/monkey.webp');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [192, 512];
for (const size of sizes) {
    const outPath = path.join(outputDir, `pwa-${size}x${size}.png`);
    try {
        await sharp(src)
            .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 26, alpha: 1 } })
            .png()
            .toFile(outPath);
        const stat = fs.statSync(outPath);
        console.log(`Created: ${outPath} (${stat.size} bytes)`);
    } catch (e) {
        console.log(`Error generating ${size}x${size}: ${e.message}`);
    }
}