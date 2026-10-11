<?php

namespace Tests\Feature;

use Tests\TestCase;

class RoutesTest extends TestCase
{
    public function test_api(): void
    {
        $this->get('/api/')->assertNotFound();
    }

    public function test_api_not_found(): void
    {
        $this->get('/api/pagina-che-non-esiste')->assertNotFound();
    }

    public function test_home_serves_the_spa(): void
    {
        $this->get('/')->assertOk()->assertSee('id="root"', false);
    }

    public function test_unknown_url_returns_404_but_serves_the_spa(): void
    {
        $this->get('/pagina-che-non-esiste')
            ->assertNotFound()
            ->assertSee('id="root"', false);
    }
}
