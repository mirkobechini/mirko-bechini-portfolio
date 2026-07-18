import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import purgecss from 'vite-plugin-purgecss';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/js/app.js'],
            refresh: true,
        }),
        purgecss({
            content: [
                'resources/js/src/**/*.{jsx,js,tsx,ts}',
                'resources/views/**/*.blade.php',
            ],
            safelist: {
                standard: [
                    'sprite', 'sprite-tag', 'sprite-character',
                    'den-container', 'den-wrapper', 'den-image',
                    'scroll-guide-left', 'scroll-guide-right',
                    'nes-container', 'nes-icon', 'nes-badge',
                    'is-rounded', 'is-medium',
                ],
                greedy: [/modal/, /game-/],
            },
            defaultExtractor(content) {
                return content.match(/[\w-/:]+(?<!:)/g) || [];
            },
        }),
    ],
});
