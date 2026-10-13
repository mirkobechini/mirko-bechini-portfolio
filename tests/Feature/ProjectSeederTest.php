<?php

namespace Tests\Feature;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_imports_the_eleven_starting_projects(): void
    {
        $this->seed(ProjectSeeder::class);

        $this->assertSame(11, Project::count());
        $this->assertSame(4, Project::where('pinned', true)->count());
        $this->assertSame(0, Project::where('hidden', true)->count());
    }

    public function test_every_imported_project_has_valid_values(): void
    {
        $this->seed(ProjectSeeder::class);

        foreach (Project::all() as $project) {
            $this->assertContains($project->type, ProjectType::cases(), $project->github_repo);
            $this->assertContains($project->scope, ProjectScope::cases(), $project->github_repo);
            $this->assertNotEmpty($project->title, $project->github_repo);
            $this->assertNotEmpty($project->description_it, $project->github_repo);
            $this->assertStringStartsWith('https://github.com/mirkobechini/', $project->repo_url);
        }
    }

    public function test_the_manual_technologies_are_kept_apart_from_the_github_ones(): void
    {
        $this->seed(ProjectSeeder::class);

        $pdfEditor = Project::where('github_repo', 'pdfEditor')->first();

        $this->assertContains('AI', $pdfEditor->extra_technologies);
        $this->assertContains('Tauri', $pdfEditor->extra_technologies);
        $this->assertNotContains('AI', $pdfEditor->technologies ?? []);
    }

    public function test_a_placeholder_live_url_is_stored_as_null(): void
    {
        $this->seed(ProjectSeeder::class);

        $this->assertSame(0, Project::where('live_url', '#')->count());
        $this->assertSame('https://mirkobechini.github.io/tenzies/', Project::where('github_repo', 'tenzies')->value('live_url'));
        $this->assertNull(Project::where('github_repo', 'gods-backoffice')->value('live_url'));
    }

    public function test_running_it_twice_does_not_duplicate_anything(): void
    {
        $this->seed(ProjectSeeder::class);
        $this->seed(ProjectSeeder::class);

        $this->assertSame(11, Project::count());
    }

    public function test_it_never_overwrites_what_was_edited_in_the_panel(): void
    {
        $this->seed(ProjectSeeder::class);
        Project::where('github_repo', 'tenzies')->update([
            'description_it' => 'Scritta dal pannello',
            'pinned' => true,
            'hidden' => true,
        ]);

        $this->seed(ProjectSeeder::class);

        $tenzies = Project::where('github_repo', 'tenzies')->first();
        $this->assertSame('Scritta dal pannello', $tenzies->description_it);
        $this->assertTrue($tenzies->pinned);
        $this->assertTrue($tenzies->hidden);
    }

    /**
     * Caso reale: in produzione la sincronizzazione GitHub ha girato PRIMA del seed e ha creato i progetti
     * nascosti, con il nome del repo come titolo e senza descrizione.
     */
    private function createLikeTheSyncDid(string $repo, array $overrides = []): Project
    {
        return Project::create($overrides + [
            'github_repo' => $repo,
            'title' => $repo,
            'description_it' => null,
            'type' => ProjectType::Fullstack,
            'scope' => ProjectScope::Personal,
            'technologies' => ['Dal sync'],
            'repo_url' => 'https://github.com/mirkobechini/'.$repo,
            'stars' => 7,
            'pushed_at' => '2026-10-01 10:00:00',
            'hidden' => true,
        ]);
    }

    public function test_it_fills_the_hand_written_fields_of_projects_the_sync_created_first(): void
    {
        $this->createLikeTheSyncDid('PdfEditor'); // il sync scrive il nome come lo vede su GitHub

        $this->seed(ProjectSeeder::class);

        $this->assertSame(11, Project::count()); // nessun doppione, anche con maiuscole diverse
        $project = Project::where('github_repo', 'PdfEditor')->firstOrFail();
        $this->assertNotEmpty($project->description_it);
        $this->assertSame('PdfEditor', $project->title);
        $this->assertContains('AI', $project->extra_technologies);
        $this->assertFalse($project->hidden);
        $this->assertSame(ProjectType::Fullstack, $project->type);
    }

    public function test_it_keeps_the_github_owned_fields_of_those_projects(): void
    {
        $this->createLikeTheSyncDid('tenzies');

        $this->seed(ProjectSeeder::class);

        $project = Project::where('github_repo', 'tenzies')->firstOrFail();
        $this->assertSame(['Dal sync'], $project->technologies);
        $this->assertSame(7, $project->stars);
        $this->assertSame('https://github.com/mirkobechini/tenzies', $project->repo_url);
        $this->assertSame('2026-10-01 10:00:00', $project->pushed_at->format('Y-m-d H:i:s'));
        $this->assertSame('tenzies', $project->github_repo);
    }

    public function test_it_leaves_projects_that_are_not_in_the_seed_data_alone(): void
    {
        $other = $this->createLikeTheSyncDid('altro-repo');

        $this->seed(ProjectSeeder::class);

        $other->refresh();
        $this->assertNull($other->description_it);
        $this->assertTrue($other->hidden);
        $this->assertSame('altro-repo', $other->title);
    }

    public function test_it_does_not_touch_a_synced_project_the_user_already_described(): void
    {
        $this->createLikeTheSyncDid('tenzies', ['description_it' => 'La mia descrizione', 'hidden' => false, 'title' => 'Titolo mio']);

        $this->seed(ProjectSeeder::class);

        $project = Project::where('github_repo', 'tenzies')->firstOrFail();
        $this->assertSame('La mia descrizione', $project->description_it);
        $this->assertSame('Titolo mio', $project->title);
    }

    public function test_the_skills_link_to_projects_that_were_created_by_the_sync_first(): void
    {
        foreach (['gods-guest-site', 'gods-backoffice', 'CV_Backoffice', 'mirko-bechini-portfolio'] as $repo) {
            $this->createLikeTheSyncDid($repo);
        }

        $this->seed(DatabaseSeeder::class);

        $html = Skill::where('name', 'HTML')->firstOrFail();
        $this->assertContains('Gods Guest Site', $html->projects->pluck('title')->all());
    }

    public function test_it_restores_a_project_that_was_deleted(): void
    {
        $this->seed(ProjectSeeder::class);
        Project::where('github_repo', 'quizzical')->delete();

        $this->seed(ProjectSeeder::class);

        $this->assertSame(11, Project::count());
    }

    public function test_the_database_seeder_imports_projects_and_creates_no_fake_user(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(11, Project::count());
        $this->assertSame(0, User::count());
    }
}
