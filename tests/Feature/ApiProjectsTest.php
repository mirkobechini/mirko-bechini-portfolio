<?php

namespace Tests\Feature;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Models\Course;
use App\Models\Project;
use App\Models\ProjectGroup;
use App\Support\PublicProjects;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ApiProjectsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<array<string, mixed>>
     */
    private function projects(): array
    {
        return $this->getJson('/api/projects')->assertOk()->json('data');
    }

    // ---------- contenuto ----------

    public function test_it_returns_an_empty_list_when_there_are_no_projects(): void
    {
        $this->getJson('/api/projects')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_hidden_projects_are_never_exposed(): void
    {
        Project::factory()->create(['github_repo' => 'visibile', 'hidden' => false]);
        Project::factory()->create(['github_repo' => 'nascosto', 'hidden' => true]);

        $this->assertSame(['visibile'], array_column($this->projects(), 'id'));
    }

    public function test_a_project_has_exactly_the_fields_the_site_uses(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Cliente A', 'description' => 'Appunti riservati']);
        Project::factory()->create([
            'github_repo' => 'gods-backoffice',
            'title' => 'Gods Backoffice',
            'description_it' => 'Un backend.',
            'type' => ProjectType::Backend,
            'scope' => ProjectScope::Work,
            'technologies' => ['PHP', 'Laravel'],
            'extra_technologies' => ['AI'],
            'repo_url' => 'https://github.com/mirkobechini/gods-backoffice',
            'live_url' => 'https://gods.example.com',
            'stars' => 7,
            'pushed_at' => '2026-09-01 10:00:00',
            'pinned' => true,
            'project_group_id' => $group->id,
        ]);

        $project = $this->projects()[0];

        $this->assertEqualsCanonicalizing(
            ['id', 'title', 'description', 'preview', 'projectScope', 'type', 'technologies', 'repo', 'live', 'stars', 'updatedAt', 'pinned', 'course', 'group'],
            array_keys($project)
        );
        $this->assertSame('gods-backoffice', $project['id']);
        $this->assertSame('Gods Backoffice', $project['title']);
        $this->assertSame('Un backend.', $project['description']);
        $this->assertSame('work', $project['projectScope']);
        $this->assertSame('backend', $project['type']);
        $this->assertSame(['PHP', 'Laravel', 'AI'], $project['technologies']);
        $this->assertSame('https://github.com/mirkobechini/gods-backoffice', $project['repo']);
        $this->assertSame('https://gods.example.com', $project['live']);
        $this->assertSame(7, $project['stars']);
        $this->assertStringStartsWith('2026-09-01T10:00:00', $project['updatedAt']);
        $this->assertTrue($project['pinned']);
        $this->assertSame(['id' => $group->id, 'name' => 'Cliente A'], $project['group']);
    }

    public function test_missing_optional_values_are_empty_not_null_where_the_site_expects_text(): void
    {
        Project::factory()->create([
            'description_it' => null,
            'live_url' => null,
            'pushed_at' => null,
            'technologies' => null,
            'extra_technologies' => null,
            'project_group_id' => null,
        ]);

        $project = $this->projects()[0];

        $this->assertSame('', $project['description']);
        $this->assertNull($project['live']);
        $this->assertNull($project['updatedAt']);
        $this->assertSame([], $project['technologies']);
        $this->assertNull($project['group']);
    }

    public function test_technologies_merge_github_and_manual_ones_without_duplicates(): void
    {
        Project::factory()->create([
            'technologies' => ['JavaScript', 'react'],
            'extra_technologies' => ['javascript', 'Figma', 'REACT'],
        ]);

        $this->assertSame(['JavaScript', 'react', 'Figma'], $this->projects()[0]['technologies']);
    }

    public function test_private_data_is_never_exposed(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Azienda B', 'description' => 'SEGRETO-DEL-GRUPPO']);
        Project::factory()->create(['project_group_id' => $group->id, 'synced_at' => '2026-01-02 03:04:05']);

        $body = $this->getJson('/api/projects')->getContent();

        $this->assertStringNotContainsString('SEGRETO-DEL-GRUPPO', $body);
        $this->assertStringNotContainsString('synced_at', $body);
        $this->assertStringNotContainsString('hidden', $body);
        $this->assertStringNotContainsString('github_repo', $body);
        $this->assertStringNotContainsString('extra_technologies', $body);
    }

    // ---------- ordine ----------

    public function test_pinned_come_first_then_the_most_recent_and_undated_last(): void
    {
        Project::factory()->create(['github_repo' => 'vecchio', 'pushed_at' => '2020-01-01 00:00:00', 'pinned' => false]);
        Project::factory()->create(['github_repo' => 'recente', 'pushed_at' => '2026-09-01 00:00:00', 'pinned' => false]);
        Project::factory()->create(['github_repo' => 'senza-data', 'pushed_at' => null, 'pinned' => false]);
        Project::factory()->create(['github_repo' => 'fissato-vecchio', 'pushed_at' => '2019-01-01 00:00:00', 'pinned' => true]);
        Project::factory()->create(['github_repo' => 'fissato-nuovo', 'pushed_at' => '2026-10-01 00:00:00', 'pinned' => true]);

        $this->assertSame(
            ['fissato-nuovo', 'fissato-vecchio', 'recente', 'vecchio', 'senza-data'],
            array_column($this->projects(), 'id')
        );
    }

    // ---------- intestazioni ----------

    public function test_the_response_is_json_with_security_headers_and_no_cookies(): void
    {
        $response = $this->getJson('/api/projects')->assertOk();

        $this->assertStringContainsString('application/json', $response->headers->get('Content-Type'));
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertCount(0, $response->headers->getCookies());
    }

    public function test_no_cors_headers_are_sent(): void
    {
        $this->getJson('/api/projects', ['Origin' => 'https://altro-sito.example.com'])
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_it_can_be_cached_by_browsers_and_cdns(): void
    {
        $cacheControl = $this->getJson('/api/projects')->headers->get('Cache-Control');

        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=300', $cacheControl);
        $this->assertStringContainsString('s-maxage=600', $cacheControl);
        $this->assertStringContainsString('stale-while-revalidate=60', $cacheControl);
    }

    public function test_an_unchanged_response_is_answered_with_304_and_no_body(): void
    {
        Project::factory()->create();
        $etag = $this->getJson('/api/projects')->headers->get('ETag');

        $this->assertNotEmpty($etag);

        $second = $this->getJson('/api/projects', ['If-None-Match' => $etag]);
        $second->assertStatus(304);
        $this->assertSame('', $second->getContent());
    }

    public function test_the_etag_changes_when_the_data_changes(): void
    {
        $project = Project::factory()->create(['title' => 'Prima']);
        $before = $this->getJson('/api/projects')->headers->get('ETag');

        $project->update(['title' => 'Dopo']);
        $response = $this->getJson('/api/projects', ['If-None-Match' => $before]);

        $response->assertOk();
        $this->assertNotSame($before, $response->headers->get('ETag'));
    }

    // ---------- cache lato server ----------

    public function test_the_second_request_does_not_query_the_projects_again(): void
    {
        Project::factory()->count(3)->create();
        $this->getJson('/api/projects')->assertOk();

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson('/api/projects')->assertOk();

        $this->assertSame([], array_filter(DB::getQueryLog(), fn (array $q): bool => str_contains($q['query'], 'projects')));
    }

    public function test_a_cold_request_uses_two_queries_regardless_of_the_number_of_projects(): void
    {
        $group = ProjectGroup::factory()->create();
        $course = Course::factory()->create();
        Project::factory()->count(15)->create(['project_group_id' => $group->id, 'course_id' => $course->id]);
        Cache::forget(PublicProjects::CACHE_KEY);

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson('/api/projects')->assertOk();

        $this->assertCount(3, DB::getQueryLog()); // progetti + raggruppamenti + corsi, niente N+1
    }

    public function test_saving_a_project_refreshes_the_api(): void
    {
        $project = Project::factory()->create(['title' => 'Prima', 'stars' => 1]);
        $this->assertSame('Prima', $this->projects()[0]['title']);

        $project->update(['title' => 'Dopo', 'stars' => 9]);

        $this->assertSame('Dopo', $this->projects()[0]['title']);
        $this->assertSame(9, $this->projects()[0]['stars']);
    }

    public function test_hiding_a_project_removes_it_and_showing_it_again_brings_it_back(): void
    {
        $project = Project::factory()->create(['hidden' => false]);
        $this->assertCount(1, $this->projects());

        $project->update(['hidden' => true]);
        $this->assertCount(0, $this->projects());

        $project->update(['hidden' => false]);
        $this->assertCount(1, $this->projects());
    }

    public function test_creating_and_deleting_projects_refreshes_the_api(): void
    {
        $this->assertCount(0, $this->projects());

        $project = Project::factory()->create();
        $this->assertCount(1, $this->projects());

        $project->delete();
        $this->assertCount(0, $this->projects());
    }

    public function test_renaming_or_deleting_a_group_refreshes_the_api(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Vecchio nome']);
        Project::factory()->create(['project_group_id' => $group->id]);
        $this->assertSame('Vecchio nome', $this->projects()[0]['group']['name']);

        $group->update(['name' => 'Nuovo nome']);
        $this->assertSame('Nuovo nome', $this->projects()[0]['group']['name']);

        $group->delete();
        $this->assertNull($this->projects()[0]['group']);
    }

    // ---------- limite di richieste ----------

    public function test_it_allows_60_requests_a_minute_then_answers_429_in_json(): void
    {
        for ($i = 0; $i < 60; $i++) {
            $this->getJson('/api/projects')->assertOk();
        }

        $this->getJson('/api/projects')
            ->assertStatus(429)
            ->assertHeader('Retry-After')
            ->assertJsonStructure(['message']);
    }

    // ---------- errori in JSON ----------

    public function test_unknown_api_paths_answer_404_in_json_not_with_the_spa(): void
    {
        foreach (['/api', '/api/', '/api/non-esiste', '/api/projects/1', '/api/a/b/c'] as $path) {
            $response = $this->get($path);

            $response->assertNotFound();
            $this->assertStringContainsString('application/json', $response->headers->get('Content-Type'), $path);
            $response->assertJson(['message' => 'Risorsa non trovata.']);
            $response->assertDontSee('id="root"', false);
        }
    }

    public function test_writing_methods_are_not_allowed_and_answer_in_json(): void
    {
        foreach (['post', 'put', 'patch', 'delete'] as $method) {
            $response = $this->{$method.'Json'}('/api/projects');

            $response->assertStatus(405);
            $this->assertStringContainsString('application/json', $response->headers->get('Content-Type'), $method);
        }
    }

    public function test_the_portfolio_pages_are_not_affected(): void
    {
        $this->get('/')->assertOk()->assertSee('id="root"', false);
        $this->get('/pagina-che-non-esiste')->assertNotFound()->assertSee('id="root"', false);
    }

    // ---------- contratto con il sito React ----------

    /**
     * Le card e i filtri leggono questi campi (stessa forma di fallbackProjects.js): se l'API ne cambia il
     * nome, i progetti si vedrebbero vuoti. Il campo `preview` lo aggiunge il frontend (segnaposto).
     */
    public function test_the_fields_match_what_the_react_mapper_produces(): void
    {
        $js = file_get_contents(base_path('resources/js/src/features/modals/projects/services/fallbackProjects.js'));
        preg_match('/const fallbackProjects = \[\s*\{(.*?)\n    \},/s', $js, $block);
        preg_match_all('/^\s{8}([a-zA-Z]+):/m', $block[1] ?? '', $keys);

        $frontendFields = array_diff($keys[1], ['preview']);
        Project::factory()->create();
        $apiFields = array_keys($this->projects()[0]);

        $this->assertNotEmpty($frontendFields, 'Non riesco a leggere i campi di fallbackProjects.js');
        $this->assertSame([], array_values(array_diff($frontendFields, $apiFields)), 'Campi che il sito usa e l\'API non ha');
    }
}
