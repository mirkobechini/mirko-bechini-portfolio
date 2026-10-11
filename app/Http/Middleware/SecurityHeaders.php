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
        $response->headers->set('Content-Security-Policy-Report-Only', $this->contentSecurityPolicy());

        // Di solito HSTS lo imposta già Cloudflare: abilitare solo se serve (SECURITY_HSTS=true).
        if (config('security.hsts') && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }

    private function contentSecurityPolicy(): string
    {
        $iubenda = 'https://*.iubenda.com';

        return implode('; ', [
            "default-src 'self'",
            // 'unsafe-inline': lo script del loader Iubenda è inline in app.blade.php
            "script-src 'self' 'unsafe-inline' {$iubenda}",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com {$iubenda}",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "media-src 'self'",
            "connect-src 'self' https://api.github.com {$iubenda}",
            "frame-src {$iubenda}",
            "worker-src 'self'",
            "manifest-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
        ]);
    }
}
