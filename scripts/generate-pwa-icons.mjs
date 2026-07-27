import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../public/assets');
const outputDir = path.resolve(__dirname, '../public/icons');
const screenshotsDir = path.resolve(__dirname, '../public/screenshots');
const placeholderDir = path.resolve(__dirname, '../public/assets/modals/placeholder');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}
if (!fs.existsSync(placeholderDir)) {
    fs.mkdirSync(placeholderDir, { recursive: true });
}

const src = path.join(assetsDir, 'sprites/monkey.webp');

// ─── PWA Icons ───
const sizes = [48, 72, 96, 128, 144, 152, 192, 512];
const outputSizes = [];

for (const size of sizes) {
    const outPath = path.join(outputDir, `pwa-${size}x${size}.png`);
    try {
        await sharp(src)
            .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 26, alpha: 1 } })
            .png()
            .toFile(outPath);
        const stat = fs.statSync(outPath);
        console.log(`Created: pwa-${size}x${size}.png (${stat.size} bytes)`);
        outputSizes.push(size);
    } catch (e) {
        console.log(`Error generating ${size}x${size}: ${e.message}`);
    }
}

// ─── Placeholder Image for Projects ───
const placeholderPath = path.join(placeholderDir, 'project-placeholder.webp');
try {
    // Create a minimal placeholder using the first sprite as base, darkened
    await sharp(src)
        .resize(300, 200, { fit: 'cover', background: { r: 26, g: 26, b: 26, alpha: 1 } })
        .webp({ quality: 30 })
        .toFile(placeholderPath);
    const stat = fs.statSync(placeholderPath);
    console.log(`Created: project-placeholder.webp (${stat.size} bytes)`);
} catch (e) {
    console.log(`Error generating placeholder: ${e.message}`);
}

// ─── PWA Screenshots ───
// Desktop screenshot: 1280x720 with dark background
const desktopScreenshotPath = path.join(screenshotsDir, 'desktop-screenshot.webp');
try {
    const denBg = path.join(assetsDir, 'backgrounds/den.webp');
    const bgInfo = await sharp(denBg).metadata();
    const bgWidth = bgInfo.width ?? 1568;
    const bgHeight = bgInfo.height ?? 454;

    await sharp({
        create: {
            width: 1280,
            height: 720,
            channels: 3,
            background: { r: 26, g: 26, b: 26 },
        },
    })
        .composite([
            {
                input: await sharp(denBg).resize(1280, Math.round(1280 * bgHeight / bgWidth), { fit: 'inside' }).toBuffer(),
                top: 0,
                left: 0,
            },
        ])
        .webp({ quality: 70 })
        .toFile(desktopScreenshotPath);
    const stat = fs.statSync(desktopScreenshotPath);
    console.log(`Created: desktop-screenshot.webp (${stat.size} bytes)`);
} catch (e) {
    console.log(`Error generating desktop screenshot: ${e.message}`);
}

// Mobile screenshot: 360x780 with dark background
const mobileScreenshotPath = path.join(screenshotsDir, 'mobile-screenshot.webp');
try {
    const denBg = path.join(assetsDir, 'backgrounds/den.webp');
    await sharp({
        create: {
            width: 360,
            height: 780,
            channels: 3,
            background: { r: 26, g: 26, b: 26 },
        },
    })
        .composite([
            {
                input: await sharp(denBg).resize(360, undefined, { fit: 'cover' }).toBuffer(),
                top: 0,
                left: 0,
            },
        ])
        .webp({ quality: 70 })
        .toFile(mobileScreenshotPath);
    const stat = fs.statSync(mobileScreenshotPath);
    console.log(`Created: mobile-screenshot.webp (${stat.size} bytes)`);
} catch (e) {
    console.log(`Error generating mobile screenshot: ${e.message}`);
}

console.log('\n✅ All done!');
console.log(`Icons: ${outputSizes.length} sizes generated`);
console.log(`Placeholder: ${fs.existsSync(placeholderPath) ? 'OK' : 'FAILED'}`);
console.log(`Screenshots: ${fs.existsSync(desktopScreenshotPath) && fs.existsSync(mobileScreenshotPath) ? 'OK' : 'FAILED'}`);