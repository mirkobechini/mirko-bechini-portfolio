/// <reference types="vitest" />
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/js/app.js'],
            refresh: true,
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico'],
            manifest: {
                name: 'Mirko Bechini - Portfolio',
                short_name: 'Mirko Portfolio',
                description: 'Il portfolio di Mirko Bechini: progetti di sviluppo web e competenze.',
                lang: 'it',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                orientation: 'any',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/icons/pwa-48x48.png',
                        sizes: '48x48',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-72x72.png',
                        sizes: '72x72',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-96x96.png',
                        sizes: '96x96',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-128x128.png',
                        sizes: '128x128',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-144x144.png',
                        sizes: '144x144',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-152x152.png',
                        sizes: '152x152',
                        type: 'image/png',
                    },
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
                    {
                        src: '/icons/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                screenshots: [
                    {
                        src: '/screenshots/desktop-screenshot.webp',
                        sizes: '1280x720',
                        type: 'image/webp',
                        form_factor: 'wide',
                        label: 'Vista desktop del portfolio',
                    },
                    {
                        src: '/screenshots/mobile-screenshot.webp',
                        sizes: '360x780',
                        type: 'image/webp',
                        form_factor: 'narrow',
                        label: 'Vista mobile del portfolio',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,ogg}'],
                navigateFallback: '/',
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
                navigationPreload: false,
                disableDevLogs: true,
            },
        }),
    ],
    build: {
        cssCodeSplit: false,
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
