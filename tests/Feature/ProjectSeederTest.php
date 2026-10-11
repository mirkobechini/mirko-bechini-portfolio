<?php

namespace Tests\Feature;

use App\Models\Project;
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
            $this->assertContains($project->type, ['frontend', 'backend', 'fullstack'], $project->github_repo);
            $this->assertContains($project->scope, ['personal', 'work'], $project->github_repo);
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
