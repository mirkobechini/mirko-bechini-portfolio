<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Aggiunge gli header di sicurezza a ogni risposta (anche alle 404).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // Sola osservazione: il browser segnala le violazioni in console ma non blocca nulla.
        // Quando la console è pulita si passa a 'Content-Security-Policy'.
        // Il pannello Filament (/admin) è escluso: Livewire e Alpine usano script inline e valutazioni
        // dinamiche che questa policy segnalerebbe di continuo (e bloccherebbe, da enforcing).
        if (! $request->is('admin', 'admin/*')) {
            $response->headers->set('Content-Security-Policy-Report-Only', $this->contentSecurityPolicy());
        }

        // Di solito HSTS lo imposta già Cloudflare: abilitare solo se serve (SECURITY_HSTS=true).
        if (config('security.hsts') && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }

    private function contentSecurityPolicy(): string
    {
        $iubenda = 'https://*.iubenda.com';
        [$viteHttp, $viteWs] = $this->viteDevOrigins();

        return implode('; ', [
            "default-src 'self'",
            // 'unsafe-inline': lo script del loader Iubenda è inline in app.blade.php
            "script-src 'self' 'unsafe-inline' {$iubenda}{$viteHttp}",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com {$iubenda}{$viteHttp}",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "media-src 'self'",
            "connect-src 'self' https://api.github.com {$iubenda}{$viteHttp}{$viteWs}",
            "frame-src {$iubenda}",
            "worker-src 'self'",
            "manifest-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
        ]);
    }

    /**
     * Origini del dev server Vite (script/CSS via HTTP, HMR via WebSocket), solo in locale
     * e solo mentre Vite è in esecuzione (esiste public/hot). Così la console mostra solo
     * le violazioni vere. Restituisce due stringhe già pronte da accodare alle direttive.
     *
     * @return array{0: string, 1: string}
     */
    private function viteDevOrigins(): array
    {
        $hotFile = public_path('hot');

        if (! app()->environment('local') || ! is_file($hotFile)) {
            return ['', ''];
        }

        $parts = parse_url(trim((string) file_get_contents($hotFile)));

        if (! isset($parts['scheme'], $parts['host'])) {
            return ['', ''];
        }

        $authority = $parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '');
        $wsScheme = $parts['scheme'] === 'https' ? 'wss' : 'ws';

        return [" {$parts['scheme']}://{$authority}", " {$wsScheme}://{$authority}"];
    }
}
