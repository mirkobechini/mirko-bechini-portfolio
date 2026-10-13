<?php

namespace Tests\Feature;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\GithubSync\ProjectSyncer;
use App\Models\Project;
use App\Models\ProjectGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectSyncerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Un repository come lo restituisce GithubClient (già normalizzato).
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function repo(string $name, array $overrides = []): array
    {
        return array_merge([
            'name' => $name,
            'html_url' => "https://github.com/mirkobechini/{$name}",
            'homepage' => null,
            'language' => 'PHP',
            'topics' => ['laravel'],
            'stars' => 5,
            'pushed_at' => '2026-09-01T10:00:00Z',
        ], $overrides);
    }

    private function sync(array $repos, int $skipped = 0)
    {
        return app(ProjectSyncer::class)->sync($repos, $skipped);
    }

    // ---------- repository nuovi ----------

    public function test_a_new_repository_is_created_hidden_with_the_defaults(): void
    {
        $result = $this->sync([$this->repo('nuovo-repo')]);

        $project = Project::where('github_repo', 'nuovo-repo')->firstOrFail();
        $this->assertTrue($project->hidden);
        $this->assertFalse($project->pinned);
        $this->assertSame('nuovo-repo', $project->title);
        $this->assertSame('https://github.com/mirkobechini/nuovo-repo', $project->repo_url);
        $this->assertSame(['PHP', 'laravel'], $project->technologies);
        $this->assertSame(5, $project->stars);
        $this->assertSame('2026-09-01', $project->pushed_at->toDateString());
        $this->assertNotNull($project->synced_at);
        $this->assertSame(ProjectType::Fullstack, $project->fresh()->type);
        $this->assertSame(ProjectScope::Personal, $project->fresh()->scope);
        $this->assertNull($project->description_it);
        $this->assertSame(['nuovo-repo'], $result->created);
    }

    public function test_a_valid_homepage_becomes_the_live_url_of_a_new_project_only(): void
    {
        $this->sync([
            $this->repo('con-sito', ['homepage' => 'https://sito.example.com']),
            $this->repo('sito-rotto', ['homepage' => 'non un indirizzo']),
            $this->repo('sito-ftp', ['homepage' => 'ftp://example.com']),
            $this->repo('senza-sito', ['homepage' => '']),
        ]);

        $this->assertSame('https://sito.example.com', Project::where('github_repo', 'con-sito')->value('live_url'));
        $this->assertNull(Project::where('github_repo', 'sito-rotto')->value('live_url'));
        $this->assertNull(Project::where('github_repo', 'sito-ftp')->value('live_url'));
        $this->assertNull(Project::where('github_repo', 'senza-sito')->value('live_url'));
    }

    // ---------- progetti esistenti ----------

    public function test_an_existing_project_only_gets_the_github_fields_updated(): void
    {
        $group = ProjectGroup::factory()->create();
        $project = Project::factory()->create([
            'github_repo' => 'esistente',
            'title' => 'Titolo del pannello',
            'description_it' => 'Descrizione in italiano',
            'type' => ProjectType::Backend,
            'scope' => ProjectScope::Work,
            'extra_technologies' => ['AI'],
            'live_url' => 'https://mio-sito.example.com',
            'pinned' => true,
            'hidden' => false,
            'project_group_id' => $group->id,
            'repo_url' => 'https://github.com/vecchio/indirizzo',
            'technologies' => ['COBOL'],
            'stars' => 1,
            'pushed_at' => '2020-01-01 00:00:00',
        ]);

        $result = $this->sync([$this->repo('esistente', [
            'homepage' => 'https://altro-sito.example.com',
            'language' => 'Go',
            'topics' => ['cli'],
            'stars' => 99,
            'pushed_at' => '2026-10-01T08:30:00Z',
        ])]);

        $project = $project->fresh();
        // aggiornati da GitHub
        $this->assertSame('https://github.com/mirkobechini/esistente', $project->repo_url);
        $this->assertSame(['Go', 'cli'], $project->technologies);
        $this->assertSame(99, $project->stars);
        $this->assertSame('2026-10-01', $project->pushed_at->toDateString());
        // del pannello: intatti
        $this->assertSame('Titolo del pannello', $project->title);
        $this->assertSame('Descrizione in italiano', $project->description_it);
        $this->assertSame(ProjectType::Backend, $project->type);
        $this->assertSame(ProjectScope::Work, $project->scope);
        $this->assertSame(['AI'], $project->extra_technologies);
        $this->assertSame('https://mio-sito.example.com', $project->live_url);
        $this->assertTrue($project->pinned);
        $this->assertFalse($project->hidden);
        $this->assertSame($group->id, $project->project_group_id);

        $this->assertSame(['esistente'], $result->updated);
        $this->assertSame([], $result->created);
    }

    public function test_a_project_hidden_in_the_panel_stays_hidden_and_a_visible_one_stays_visible(): void
    {
        Project::factory()->create(['github_repo' => 'nascosto', 'hidden' => true]);
        Project::factory()->create(['github_repo' => 'visibile', 'hidden' => false]);

        $this->sync([$this->repo('nascosto'), $this->repo('visibile')]);

        $this->assertTrue(Project::where('github_repo', 'nascosto')->value('hidden'));
        $this->assertFalse(Project::where('github_repo', 'visibile')->value('hidden'));
    }

    public function test_unchanged_projects_are_counted_apart_but_still_marked_as_synced(): void
    {
        $project = Project::factory()->create([
            'github_repo' => 'uguale',
            'repo_url' => 'https://github.com/mirkobechini/uguale',
            'technologies' => ['PHP', 'laravel'],
            'stars' => 5,
            'pushed_at' => '2026-09-01 10:00:00',
            'synced_at' => '2026-01-01 00:00:00',
        ]);

        $result = $this->sync([$this->repo('uguale')]);

        $this->assertSame([], $result->updated);
        $this->assertSame(1, $result->unchanged);
        $this->assertTrue($project->fresh()->synced_at->greaterThan('2026-06-01'));
    }

    public function test_repository_names_match_regardless_of_case_without_duplicates(): void
    {
        Project::factory()->create(['github_repo' => 'CV_Backoffice', 'title' => 'CV Backoffice']);

        $result = $this->sync([$this->repo('cv_backoffice', ['stars' => 42])]);

        $this->assertSame(1, Project::count());
        $this->assertSame(42, Project::first()->stars);
        $this->assertSame('CV_Backoffice', Project::first()->github_repo);
        $this->assertSame([], $result->created);
    }

    // ---------- progetti non più su GitHub ----------

    public function test_a_project_that_is_no_longer_on_github_is_left_untouched(): void
    {
        $gone = Project::factory()->create([
            'github_repo' => 'sparito',
            'hidden' => false,
            'stars' => 7,
            'synced_at' => '2026-01-01 00:00:00',
        ]);

        $this->sync([$this->repo('altro')]);

        $gone = $gone->fresh();
        $this->assertFalse($gone->hidden);
        $this->assertSame(7, $gone->stars);
        $this->assertSame('2026-01-01', $gone->synced_at->toDateString());
    }

    public function test_an_empty_github_answer_does_not_hide_or_delete_anything(): void
    {
        Project::factory()->count(3)->create(['hidden' => false]);

        $this->sync([]);

        $this->assertSame(3, Project::count());
        $this->assertSame(0, Project::where('hidden', true)->count());
    }

    // ---------- tecnologie ----------

    public function test_technologies_are_the_language_plus_topics_without_case_insensitive_duplicates(): void
    {
        $this->sync([$this->repo('x', ['language' => 'JavaScript', 'topics' => ['javascript', 'react', 'React', 'vite']])]);

        $this->assertSame(['JavaScript', 'react', 'vite'], Project::where('github_repo', 'x')->value('technologies'));
    }

    public function test_a_repository_without_language_or_topics_gets_an_empty_list(): void
    {
        $this->sync([$this->repo('vuoto', ['language' => null, 'topics' => []])]);

        $this->assertSame([], Project::where('github_repo', 'vuoto')->value('technologies'));
    }

    // ---------- esito e atomicità ----------

    public function test_the_result_counts_everything(): void
    {
        Project::factory()->create(['github_repo' => 'da-aggiornare', 'stars' => 0]);
        Project::factory()->create([
            'github_repo' => 'invariato',
            'repo_url' => 'https://github.com/mirkobechini/invariato',
            'technologies' => ['PHP', 'laravel'],
            'stars' => 5,
            'pushed_at' => '2026-09-01 10:00:00',
        ]);

        $result = $this->sync([
            $this->repo('da-aggiornare'),
            $this->repo('invariato'),
            $this->repo('nuovo'),
        ], skipped: 2);

        $this->assertSame(['nuovo'], $result->created);
        $this->assertSame(['da-aggiornare'], $result->updated);
        $this->assertSame(1, $result->unchanged);
        $this->assertSame(2, $result->skipped);
        $this->assertSame('1 nuovi (creati nascosti), 1 aggiornati, 1 invariati, 2 ignorati (fork o archiviati)', $result->summary());
    }

    public function test_nothing_is_saved_if_the_sync_fails_half_way(): void
    {
        Project::factory()->create(['github_repo' => 'esistente', 'stars' => 1]);

        try {
            $this->sync([
                $this->repo('nuovo-valido'),
                $this->repo('esistente', ['stars' => 500]),
                ['html_url' => 'manca-il-nome'], // dato rotto: il sync si interrompe qui
            ]);
            $this->fail('Doveva interrompersi');
        } catch (\Throwable) {
            // atteso
        }

        $this->assertSame(1, Project::count());
        $this->assertNull(Project::where('github_repo', 'nuovo-valido')->first());
        $this->assertSame(1, Project::where('github_repo', 'esistente')->value('stars'));
    }
}
