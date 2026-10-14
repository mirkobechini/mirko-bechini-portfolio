import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../public/assets');
const screenshotsDir = path.resolve(__dirname, '../public/screenshots');
const placeholderDir = path.resolve(__dirname, '../public/assets/modals/placeholder');

if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}
if (!fs.existsSync(placeholderDir)) {
    fs.mkdirSync(placeholderDir, { recursive: true });
}

const src = path.join(assetsDir, 'sprites/monkey.webp');

// Le icone PWA, l'icona iOS e la favicon NON si generano più qui: partono dal logo (public/favicon.svg),
// vedi scripts/generate-logo-icons.mjs.
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
console.log(`Placeholder: ${fs.existsSync(placeholderPath) ? 'OK' : 'FAILED'}`);
console.log(`Screenshots: ${fs.existsSync(desktopScreenshotPath) && fs.existsSync(mobileScreenshotPath) ? 'OK' : 'FAILED'}`);