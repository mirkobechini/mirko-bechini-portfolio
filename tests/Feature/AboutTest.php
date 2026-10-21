<?php

namespace Tests\Feature;

use App\Filament\Pages\AboutMe;
use App\Models\Setting;
use App\Models\User;
use App\Support\PublicAbout;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AboutTest extends TestCase
{
    use RefreshDatabase;

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- API ----------

    public function test_without_saved_text_the_api_returns_the_default_one(): void
    {
        $this->getJson('/api/about')
            ->assertOk()
            ->assertExactJson(['data' => [PublicAbout::DEFAULTS]]);
    }

    public function test_the_api_returns_the_saved_text(): void
    {
        PublicAbout::save('Ciao!', ['Primo.', 'Secondo.']);

        $this->getJson('/api/about')->assertOk()->assertExactJson([
            'data' => [['title' => 'Ciao!', 'paragraphs' => ['Primo.', 'Secondo.']]],
        ]);
    }

    public function test_empty_paragraphs_are_dropped_and_text_is_trimmed(): void
    {
        Setting::put('about', ['title' => '  Titolo  ', 'paragraphs' => ['  uno ', '', '   ', 7, 'due']]);

        $this->assertSame(['title' => 'Titolo', 'paragraphs' => ['uno', 'due']], PublicAbout::content());
    }

    public function test_a_corrupted_setting_falls_back_to_the_default_text(): void
    {
        Setting::put('about', 'non un array');
        $this->assertSame(PublicAbout::DEFAULTS, PublicAbout::content());

        Setting::put('about', ['title' => '', 'paragraphs' => []]);
        $this->assertSame(PublicAbout::DEFAULTS, PublicAbout::content());
    }

    public function test_saving_invalidates_the_cached_response(): void
    {
        $this->getJson('/api/about')->assertOk(); // riempie la cache

        PublicAbout::save('Nuovo', ['Testo nuovo.']);

        $this->getJson('/api/about')->assertJsonPath('data.0.title', 'Nuovo');
    }

    public function test_the_response_has_etag_and_short_cache_headers(): void
    {
        $response = $this->getJson('/api/about')->assertOk();

        $this->assertNotEmpty($response->headers->get('ETag'));
        $this->assertStringContainsString('s-maxage=60', (string) $response->headers->get('Cache-Control'));

        $this->getJson('/api/about', ['If-None-Match' => $response->headers->get('ETag')])->assertStatus(304);
    }

    // ---------- pannello ----------

    public function test_the_page_is_reachable_by_an_admin_and_shows_the_current_text(): void
    {
        $this->actAsAdmin();
        PublicAbout::save('Titolo di prova', ['Un paragrafo.']);

        $this->get('/admin/about-me')->assertOk();

        Livewire::test(AboutMe::class)
            ->assertSchemaStateSet(['title' => 'Titolo di prova']);
    }

    public function test_a_non_admin_cannot_reach_the_page(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/admin/about-me')->assertForbidden();
    }

    public function test_saving_from_the_page_stores_title_and_paragraphs_in_order(): void
    {
        $this->actAsAdmin();

        Livewire::test(AboutMe::class)
            // fillForm imposta lo stato grezzo del form: nel Repeater semplice ogni voce è { text: ... }
            ->fillForm(['title' => 'Salve', 'paragraphs' => [['text' => 'Uno.'], ['text' => 'Due.'], ['text' => 'Tre.']]])
            ->callAction('save')
            ->assertHasNoFormErrors();

        $this->assertSame(['title' => 'Salve', 'paragraphs' => ['Uno.', 'Due.', 'Tre.']], PublicAbout::content());
    }

    public function test_the_page_requires_a_title_and_at_least_one_paragraph(): void
    {
        $this->actAsAdmin();

        Livewire::test(AboutMe::class)
            ->fillForm(['title' => '', 'paragraphs' => []])
            ->callAction('save')
            ->assertHasFormErrors(['title' => 'required', 'paragraphs']);

        $this->assertSame(PublicAbout::DEFAULTS, PublicAbout::content());
    }
}
