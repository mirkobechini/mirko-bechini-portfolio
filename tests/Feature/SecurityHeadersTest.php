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

    public function test_csp_is_enforced_by_default_and_allows_the_known_third_parties(): void
    {
        $response = $this->get('/')->assertHeader('Content-Security-Policy');

        $csp = $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString('https://fonts.googleapis.com', $csp);
        $this->assertStringContainsString('https://fonts.gstatic.com', $csp);
        $this->assertStringContainsString('https://*.iubenda.com', $csp);
        // Il browser non parla più con GitHub: ci pensa il backend
        $this->assertStringNotContainsString('api.github.com', $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);
        $this->assertStringContainsString("frame-ancestors 'self'", $csp);

        // La versione che blocca sostituisce quella di sola osservazione, non si sommano
        $response->assertHeaderMissing('Content-Security-Policy-Report-Only');
    }

    public function test_report_only_mode_can_be_switched_on_without_touching_the_code(): void
    {
        config(['security.csp_mode' => 'report-only']);

        $response = $this->get('/')->assertHeader('Content-Security-Policy-Report-Only');

        $response->assertHeaderMissing('Content-Security-Policy');
        $this->assertStringContainsString("default-src 'self'", $response->headers->get('Content-Security-Policy-Report-Only'));
    }

    public function test_an_unknown_mode_falls_back_to_enforcing(): void
    {
        foreach (['', 'enforced', 'off', 'REPORT-ONLY', null] as $mode) {
            config(['security.csp_mode' => $mode]);

            $this->get('/')
                ->assertHeader('Content-Security-Policy')
                ->assertHeaderMissing('Content-Security-Policy-Report-Only');
        }
    }

    public function test_the_policy_is_the_same_in_both_modes(): void
    {
        $enforced = $this->get('/')->headers->get('Content-Security-Policy');

        config(['security.csp_mode' => 'report-only']);
        $observed = $this->get('/')->headers->get('Content-Security-Policy-Report-Only');

        $this->assertSame($enforced, $observed);
    }

    public function test_the_admin_panel_is_excluded_from_the_csp_but_keeps_the_other_headers(): void
    {
        foreach (['enforce', 'report-only'] as $mode) {
            config(['security.csp_mode' => $mode]);

            $this->get('/admin/login')
                ->assertOk()
                ->assertHeaderMissing('Content-Security-Policy')
                ->assertHeaderMissing('Content-Security-Policy-Report-Only')
                ->assertHeader('X-Content-Type-Options', 'nosniff')
                ->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        }
    }

    public function test_the_portfolio_and_the_api_keep_the_csp(): void
    {
        $this->get('/')->assertHeader('Content-Security-Policy');
        $this->get('/pagina-che-non-esiste')->assertHeader('Content-Security-Policy');
        $this->getJson('/api/projects')->assertHeader('Content-Security-Policy');
    }

    public function test_every_origin_the_site_really_loads_is_allowed(): void
    {
        // Origini osservate sul sito vero con un browser (94 clic su desktop e mobile, più le pagine di Iubenda):
        // Google Fonts, Iubenda, immagini https (certificati, bucket). Se si aggiunge una terza parte, aggiornare qui.
        $csp = $this->get('/')->headers->get('Content-Security-Policy');

        $this->assertMatchesRegularExpression("/font-src [^;]*https:\/\/fonts\.gstatic\.com/", $csp);
        $this->assertMatchesRegularExpression("/style-src [^;]*https:\/\/fonts\.googleapis\.com/", $csp);
        $this->assertMatchesRegularExpression("/script-src [^;]*https:\/\/\*\.iubenda\.com/", $csp);
        $this->assertMatchesRegularExpression("/frame-src https:\/\/\*\.iubenda\.com/", $csp);
        $this->assertMatchesRegularExpression('/img-src [^;]*data: https:/', $csp); // certificati, bucket, immagini di Iubenda
        $this->assertMatchesRegularExpression("/connect-src 'self'/", $csp);       // /api/* è della stessa origine
        $this->assertMatchesRegularExpression("/worker-src 'self'/", $csp);        // service worker della PWA
        $this->assertMatchesRegularExpression("/manifest-src 'self'/", $csp);
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

    public function test_vite_dev_origins_are_not_allowed_outside_local(): void
    {
        $this->usePublicDirWithHotFile('http://[::1]:5173');

        $csp = $this->get('/')->headers->get('Content-Security-Policy');

        $this->assertStringNotContainsString('5173', $csp);
    }

    public function test_vite_dev_origins_are_allowed_in_local_while_vite_runs(): void
    {
        $this->app['env'] = 'local';
        $this->usePublicDirWithHotFile('http://[::1]:5173');

        $csp = $this->get('/')->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("script-src 'self' 'unsafe-inline' https://*.iubenda.com http://[::1]:5173", $csp);
        $this->assertStringContainsString('ws://[::1]:5173', $csp);
    }

    public function test_no_vite_origins_in_local_without_a_hot_file(): void
    {
        $this->app['env'] = 'local';
        $this->usePublicDirWithHotFile(null);

        $csp = $this->get('/')->headers->get('Content-Security-Policy');

        $this->assertStringNotContainsString('5173', $csp);
    }

    /**
     * Usa una cartella "public" temporanea, così i test non toccano il vero public/hot
     * (che esiste mentre il dev server Vite è in esecuzione).
     */
    private function usePublicDirWithHotFile(?string $hotContent): void
    {
        $dir = sys_get_temp_dir().'/portfolio-public-'.uniqid();
        mkdir($dir);

        if ($hotContent !== null) {
            file_put_contents($dir.'/hot', $hotContent);
        }

        $this->app->usePublicPath($dir);
    }
}
