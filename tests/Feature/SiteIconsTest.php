<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Le icone del sito (favicon, PWA, iOS) devono esistere davvero e avere il formato giusto: una favicon
 * vuota o un'icona del manifest mancante non dà errori visibili, ma il sito resta senza icona.
 */
class SiteIconsTest extends TestCase
{
    private function publicFile(string $path): string
    {
        return public_path(ltrim($path, '/'));
    }

    public function test_the_favicon_ico_is_a_real_icon_with_16_32_and_48_pixel_images(): void
    {
        $ico = file_get_contents($this->publicFile('favicon.ico'));

        $this->assertGreaterThan(1000, strlen($ico), 'favicon.ico è vuota o quasi');
        $header = unpack('vreserved/vtype/vcount', substr($ico, 0, 6));
        $reserved = $header['reserved'];
        $type = $header['type'];
        $count = $header['count'];
        $this->assertSame(0, $reserved);
        $this->assertSame(1, $type); // 1 = icona
        $this->assertSame(3, $count);

        $sizes = [];
        for ($i = 0; $i < $count; $i++) {
            $sizes[] = ord($ico[6 + 16 * $i]); // larghezza di ciascuna immagine
        }
        $this->assertSame([16, 32, 48], $sizes);
    }

    public function test_the_svg_favicon_is_the_logo_and_is_safe(): void
    {
        $svg = file_get_contents($this->publicFile('favicon.svg'));

        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('viewBox=', $svg);
        // Un SVG servito dal nostro dominio non deve poter eseguire script né caricare risorse esterne
        $this->assertDoesNotMatchRegularExpression('/<script|onload=|onclick=|javascript:|<image|<foreignObject|href="https?:/i', $svg);
    }

    public function test_every_manifest_icon_exists_with_the_declared_size(): void
    {
        $config = file_get_contents(base_path('vite.config.js'));
        preg_match_all("/src: '(\/icons\/[^']+\.png)',\s*sizes: '(\d+)x(\d+)'/", $config, $matches, PREG_SET_ORDER);

        $this->assertGreaterThanOrEqual(9, count($matches), 'Non riesco a leggere le icone del manifest');

        foreach ($matches as [, $src, $width, $height]) {
            $file = $this->publicFile($src);
            $this->assertFileExists($file, $src);
            $size = getimagesize($file);
            $this->assertSame([(int) $width, (int) $height], [$size[0], $size[1]], $src);
            $this->assertSame('image/png', $size['mime'], $src);
        }
    }

    public function test_the_manifest_has_a_dedicated_maskable_icon_and_the_ios_icon_exists(): void
    {
        $config = file_get_contents(base_path('vite.config.js'));

        $this->assertMatchesRegularExpression("/pwa-maskable-512x512\.png',\s*sizes: '512x512',\s*type: 'image\/png',\s*purpose: 'maskable'/", $config);
        $this->assertSame([180, 180], array_slice(getimagesize($this->publicFile('icons/apple-touch-icon.png')), 0, 2));
    }

    public function test_the_page_links_point_to_files_that_exist(): void
    {
        $html = $this->get('/')->assertOk()->getContent();

        preg_match_all('/<link rel="(?:icon|apple-touch-icon)"[^>]*href="(\/[^"]+)"/', $html, $matches);

        $this->assertContains('/favicon.svg', $matches[1]);
        $this->assertContains('/favicon.ico', $matches[1]);
        $this->assertContains('/icons/apple-touch-icon.png', $matches[1]);

        foreach ($matches[1] as $href) {
            $this->assertFileExists($this->publicFile($href), $href);
        }
    }

    public function test_the_logo_icons_have_a_transparent_background_and_the_maskable_one_does_not(): void
    {
        $any = imagecreatefrompng($this->publicFile('icons/pwa-512x512.png'));
        $maskable = imagecreatefrompng($this->publicFile('icons/pwa-maskable-512x512.png'));

        $this->assertSame(127, (imagecolorat($any, 2, 2) >> 24) & 0x7F, 'angolo trasparente (alpha 127 = vuoto)');
        $this->assertSame(0, (imagecolorat($maskable, 2, 2) >> 24) & 0x7F, 'angolo opaco');
    }
}
