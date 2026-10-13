<?php

namespace Tests\Feature;

use App\Enums\SyncFrequency;
use App\GithubSync\SyncResult;
use App\GithubSync\SyncSettings;
use App\Models\Project;
use App\Models\Setting;
use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SyncCommandTest extends TestCase
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

        $this->travelTo('2026-10-12 12:00:00');
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

    private function fakeGithub(array $repos): void
    {
        Http::fake(['api.github.com/*' => Http::response($repos)]);
    }

    // ---------- impostazioni ----------

    public function test_the_default_frequency_is_weekly(): void
    {
        $this->assertSame(SyncFrequency::Weekly, app(SyncSettings::class)->frequency());
    }

    public function test_the_frequency_can_be_changed_and_is_remembered(): void
    {
        app(SyncSettings::class)->setFrequency(SyncFrequency::Biweekly);

        $this->assertSame(SyncFrequency::Biweekly, (new SyncSettings)->frequency());
    }

    public function test_an_invalid_stored_frequency_falls_back_to_weekly(): void
    {
        Setting::put('github_sync.frequency', 'ogni-tanto');

        $this->assertSame(SyncFrequency::Weekly, app(SyncSettings::class)->frequency());
    }

    // ---------- esecuzione ----------

    public function test_the_first_run_syncs_and_records_the_result(): void
    {
        $this->fakeGithub([$this->githubRepo('uno'), $this->githubRepo('due')]);

        $this->artisan('github:sync-projects')
            ->expectsOutputToContain('Sincronizzazione completata')
            ->assertSuccessful();

        $this->assertSame(2, Project::count());
        $settings = app(SyncSettings::class);
        $this->assertTrue($settings->lastRun()['ok']);
        $this->assertStringContainsString('2 nuovi', $settings->lastRun()['message']);
        $this->assertSame('2026-10-12', $settings->lastSuccessAt()->toDateString());
    }

    public function test_it_lists_the_new_hidden_repositories_in_the_output(): void
    {
        $this->fakeGithub([$this->githubRepo('repo-nuovo')]);

        $this->artisan('github:sync-projects')
            ->expectsOutputToContain('nuovo (nascosto): repo-nuovo')
            ->assertSuccessful();
    }

    public function test_it_does_nothing_when_it_is_not_due_yet(): void
    {
        Http::fake();
        app(SyncSettings::class)->recordSuccess(new SyncResult);
        $this->travel(3)->days(); // settimanale: dopo 3 giorni non è ancora scaduto

        $this->artisan('github:sync-projects')
            ->expectsOutputToContain('Non è ancora il momento')
            ->assertSuccessful();

        Http::assertNothingSent();
    }

    public function test_it_runs_again_once_the_interval_has_passed(): void
    {
        $this->fakeGithub([$this->githubRepo('uno')]);
        app(SyncSettings::class)->recordSuccess(new SyncResult);
        $this->travel(8)->days();

        $this->artisan('github:sync-projects')->assertSuccessful();

        Http::assertSentCount(1);
        $this->assertSame(1, Project::count());
    }

    public function test_a_shorter_frequency_chosen_in_the_panel_takes_effect_immediately(): void
    {
        $this->fakeGithub([$this->githubRepo('uno')]);
        app(SyncSettings::class)->recordSuccess(new SyncResult);
        $this->travel(2)->days(); // con la frequenza settimanale non sarebbe scaduto

        app(SyncSettings::class)->setFrequency(SyncFrequency::Daily);
        $this->artisan('github:sync-projects')->assertSuccessful();

        Http::assertSentCount(1);
    }

    public function test_manual_frequency_never_runs_on_its_own_but_force_does(): void
    {
        $this->fakeGithub([$this->githubRepo('uno')]);
        app(SyncSettings::class)->setFrequency(SyncFrequency::Manual);

        $this->artisan('github:sync-projects')->expectsOutputToContain('Non è ancora il momento')->assertSuccessful();
        Http::assertNothingSent();

        $this->artisan('github:sync-projects', ['--force' => true])->assertSuccessful();
        Http::assertSentCount(1);
        $this->assertSame(1, Project::count());
    }

    public function test_force_runs_even_if_it_just_ran(): void
    {
        $this->fakeGithub([$this->githubRepo('uno')]);
        app(SyncSettings::class)->recordSuccess(new SyncResult);

        $this->artisan('github:sync-projects', ['--force' => true])->assertSuccessful();

        Http::assertSentCount(1);
    }

    // ---------- errori ----------

    public function test_a_github_error_is_recorded_and_changes_no_data(): void
    {
        Project::factory()->create(['github_repo' => 'esistente', 'stars' => 3, 'hidden' => false]);
        Http::fake(['api.github.com/*' => Http::response(['message' => 'Bad credentials'], 401)]);
        config(['services.github.token' => 'scaduto']);

        $this->artisan('github:sync-projects')->assertFailed();

        $settings = app(SyncSettings::class);
        $this->assertFalse($settings->lastRun()['ok']);
        $this->assertStringContainsString('token', $settings->lastRun()['message']);
        $this->assertNull($settings->lastSuccessAt());
        $this->assertSame(1, Project::count());
        $this->assertSame(3, Project::first()->stars);
        $this->assertFalse(Project::first()->hidden);
    }

    public function test_after_a_failure_it_tries_again_at_the_next_check_without_waiting_the_whole_interval(): void
    {
        $settings = app(SyncSettings::class);
        $settings->recordSuccess(new SyncResult);
        $this->travel(8)->days();
        Http::fake(['api.github.com/*' => Http::response([], 503)]);

        $this->artisan('github:sync-projects')->assertFailed();
        $this->assertTrue($settings->isDue(), 'dopo un errore deve restare "da fare"');

        $this->travel(1)->hours();
        Http::swap(new HttpFactory); // le simulazioni si sommano: riparto da zero, ora GitHub risponde bene
        $this->fakeGithub([$this->githubRepo('uno')]);
        $this->artisan('github:sync-projects')->assertSuccessful();

        $this->assertFalse($settings->isDue());
    }

    public function test_an_unexpected_error_is_recorded_too(): void
    {
        Http::fake(fn () => throw new \LogicException('qualcosa di strano'));

        $this->artisan('github:sync-projects')->assertFailed();

        $this->assertFalse(app(SyncSettings::class)->lastRun()['ok']);
        $this->assertStringContainsString('qualcosa di strano', app(SyncSettings::class)->lastRun()['message']);
    }

    // ---------- scheduler ----------

    public function test_the_command_is_scheduled_every_hour_without_overlapping(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->first(fn (Event $event): bool => str_contains($event->command, 'github:sync-projects'));

        $this->assertNotNull($event, 'github:sync-projects non è nello scheduler');
        $this->assertSame('0 * * * *', $event->expression);
        $this->assertTrue($event->withoutOverlapping);
    }
}
