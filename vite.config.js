/// <reference types="vitest" />
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import purgecss from 'vite-plugin-purgecss';
import { VitePWA } from 'vite-plugin-pwa';

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
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico'],
            manifest: {
                name: 'Mirko Bechini - Portfolio',
                short_name: 'Mirko Portfolio',
                description: 'Il portfolio di Mirko Bechini: progetti di sviluppo web e competenze.',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                orientation: 'any',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/icons/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,ogg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react-router-dom') ||
                        id.includes('node_modules/react-router')) {
                        return 'vendor-router';
                    }
                    if (id.includes('node_modules/react-dom') ||
                        id.includes('node_modules/react/') ||
                        id.includes('node_modules/scheduler')) {
                        return 'vendor-react';
                    }
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './resources/js/src/test/setup.js',
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
});
