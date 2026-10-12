<?php

namespace Tests\Feature;

use App\Enums\SyncFrequency;
use App\Filament\Pages\GithubSync;
use App\GithubSync\SyncResult;
use App\GithubSync\SyncSettings;
use App\Models\Project;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;
use Tests\TestCase;

class GithubSyncPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.github.username' => 'mirkobechini',
            'services.github.token' => null,
            'services.github.api_url' => 'https://api.github.com',
        ]);

        Filament::setCurrentPanel('admin');

        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function githubRepo(string $name, array $overrides = []): array
    {
        return array_merge([
            'name' => $name,
            'html_url' => "https://github.com/mirkobechini/{$name}",
            'homepage' => null,
            'language' => 'PHP',
            'topics' => [],
            'stargazers_count' => 1,
            'pushed_at' => '2026-09-01T10:00:00Z',
            'fork' => false,
            'archived' => false,
        ], $overrides);
    }

    // ---------- accesso ----------

    public function test_the_page_is_reachable_by_an_admin(): void
    {
        $this->get('/admin/github-sync')->assertOk();
    }

    public function test_a_non_admin_cannot_reach_the_page(): void
    {
        auth()->logout();
        $this->actingAs(User::factory()->create());

        $this->get('/admin/github-sync')->assertForbidden();
    }

    // ---------- frequenza ----------

    public function test_it_starts_with_the_weekly_frequency(): void
    {
        Livewire::test(GithubSync::class)
            ->assertFormSet(['frequency' => SyncFrequency::Weekly]);
    }

    public function test_it_shows_the_saved_frequency(): void
    {
        app(SyncSettings::class)->setFrequency(SyncFrequency::Monthly);

        Livewire::test(GithubSync::class)
            ->assertFormSet(['frequency' => SyncFrequency::Monthly]);
    }

    public function test_changing_the_frequency_saves_it_immediately(): void
    {
        Livewire::test(GithubSync::class)
            ->fillForm(['frequency' => 'biweekly'])
            ->assertNotified('Frequenza salvata: Ogni 2 settimane');

        $this->assertSame(SyncFrequency::Biweekly, app(SyncSettings::class)->frequency());
    }

    public function test_an_unknown_frequency_is_not_saved(): void
    {
        Livewire::test(GithubSync::class)
            ->fillForm(['frequency' => 'ogni-tanto']);

        $this->assertSame(SyncFrequency::Weekly, app(SyncSettings::class)->frequency());
    }

    // ---------- "Sincronizza ora" ----------

    public function test_sync_now_updates_the_projects_and_says_so(): void
    {
        Http::fake(['api.github.com/*' => Http::response([$this->githubRepo('uno'), $this->githubRepo('due')])]);

        Livewire::test(GithubSync::class)
            ->callAction('syncNow')
            ->assertNotified('Sincronizzazione completata');

        $this->assertSame(2, Project::count());
        $this->assertSame(2, Project::where('hidden', true)->count());
        $this->assertTrue(app(SyncSettings::class)->lastRun()['ok']);
    }

    public function test_sync_now_runs_even_with_the_manual_frequency(): void
    {
        app(SyncSettings::class)->setFrequency(SyncFrequency::Manual);
        Http::fake(['api.github.com/*' => Http::response([$this->githubRepo('uno')])]);

        Livewire::test(GithubSync::class)->callAction('syncNow');

        $this->assertSame(1, Project::count());
    }

    public function test_a_github_error_is_shown_and_changes_nothing(): void
    {
        Project::factory()->create(['github_repo' => 'esistente', 'stars' => 3]);
        Http::fake(['api.github.com/*' => Http::response(['message' => 'Bad credentials'], 401)]);

        Livewire::test(GithubSync::class)
            ->callAction('syncNow')
            ->assertNotified('Sincronizzazione non riuscita');

        $this->assertSame(3, Project::first()->stars);
        $this->assertFalse(app(SyncSettings::class)->lastRun()['ok']);
    }

    // ---------- stato mostrato ----------

    public function test_the_status_says_it_never_ran_at_first(): void
    {
        Livewire::test(GithubSync::class)
            ->assertSee('Mai.')
            ->assertSee('Nessuno.')
            ->assertSee('Al prossimo controllo orario.');
    }

    public function test_the_status_shows_the_last_run_after_a_sync(): void
    {
        Http::fake(['api.github.com/*' => Http::response([$this->githubRepo('uno')])]);

        Livewire::test(GithubSync::class)
            ->callAction('syncNow')
            ->assertSee('Riuscito')
            ->assertSee('1 nuovi (creati nascosti)');
    }

    public function test_the_status_shows_a_failed_attempt(): void
    {
        app(SyncSettings::class)->recordFailure('Limite di richieste di GitHub raggiunto.');

        Livewire::test(GithubSync::class)
            ->assertSee('Non riuscito')
            ->assertSee('Limite di richieste di GitHub raggiunto.');
    }

    public function test_the_next_run_follows_the_chosen_frequency(): void
    {
        $this->travelTo('2026-10-12 12:00:00');
        app(SyncSettings::class)->recordSuccess(new SyncResult);

        Livewire::test(GithubSync::class)
            ->assertSee('19 ottobre 2026'); // una settimana dopo

        app(SyncSettings::class)->setFrequency(SyncFrequency::Manual);

        Livewire::test(GithubSync::class)
            ->assertSee('Mai in automatico');
    }

    public function test_it_tells_whether_a_token_is_configured(): void
    {
        Livewire::test(GithubSync::class)
            ->assertSee('Non configurato')
            ->assertSee('60 richieste');

        config(['services.github.token' => 'github_pat_segreto']);

        Livewire::test(GithubSync::class)
            ->assertSee('Configurato')
            ->assertSee('5000 richieste')
            ->assertDontSee('github_pat_segreto');
    }
}
