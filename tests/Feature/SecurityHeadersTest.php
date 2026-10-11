<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_basic_security_headers_are_set(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }

    public function test_headers_are_also_set_on_404_responses(): void
    {
        $this->get('/pagina-che-non-esiste')
            ->assertNotFound()
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_csp_is_report_only_and_allows_the_known_third_parties(): void
    {
        $response = $this->get('/')->assertHeader('Content-Security-Policy-Report-Only');

        $csp = $response->headers->get('Content-Security-Policy-Report-Only');

        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString('https://fonts.googleapis.com', $csp);
        $this->assertStringContainsString('https://fonts.gstatic.com', $csp);
        $this->assertStringContainsString('https://*.iubenda.com', $csp);
        $this->assertStringContainsString('https://api.github.com', $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);

        // Report-Only: non deve esistere ancora la versione che blocca
        $response->assertHeaderMissing('Content-Security-Policy');
    }

    public function test_hsts_is_not_sent_by_default(): void
    {
        $this->get('/')->assertHeaderMissing('Strict-Transport-Security');
    }

    public function test_hsts_is_sent_over_https_when_enabled(): void
    {
        config(['security.hsts' => true]);

        $this->get('https://localhost/')
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
}
