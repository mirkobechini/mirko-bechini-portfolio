import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/js/app.js'],
            refresh: true,
        }),
        // Cache headers for hashed assets (build output)
        {
            name: 'cache-headers',
            configurePreviewServer(server) {
                server.middlewares.use((req, res, next) => {
                    const url = req.url ?? '';
                    if (/\.(js|mjs|css|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)(\?|$)/.test(url)) {
                        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                    }
                    next();
                });
            },
        },
    ],
});
