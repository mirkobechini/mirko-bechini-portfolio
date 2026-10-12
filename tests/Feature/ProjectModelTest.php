<?php

namespace Tests\Feature;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Models\Project;
use Carbon\CarbonInterface;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_minimal_project_gets_the_column_defaults(): void
    {
        $project = Project::create(['github_repo' => 'x', 'title' => 'X', 'repo_url' => 'https://github.com/u/x']);
        $project = $project->fresh();

        $this->assertSame(ProjectType::Fullstack, $project->type);
        $this->assertSame(ProjectScope::Personal, $project->scope);
        $this->assertSame(0, $project->stars);
        $this->assertFalse($project->pinned);
        $this->assertFalse($project->hidden);
        $this->assertNull($project->technologies);
        $this->assertNull($project->extra_technologies);
        $this->assertNull($project->live_url);
        $this->assertNull($project->description_it);
    }

    public function test_json_columns_are_cast_to_arrays_and_back(): void
    {
        $id = Project::create([
            'github_repo' => 'x',
            'title' => 'X',
            'repo_url' => 'u',
            'technologies' => ['PHP', 'Laravel'],
            'extra_technologies' => ['AI'],
        ])->id;

        $project = Project::find($id);

        $this->assertSame(['PHP', 'Laravel'], $project->technologies);
        $this->assertSame(['AI'], $project->extra_technologies);
    }

    public function test_booleans_and_dates_are_cast(): void
    {
        $project = Project::create([
            'github_repo' => 'x',
            'title' => 'X',
            'repo_url' => 'u',
            'pinned' => 1,
            'hidden' => 0,
            'pushed_at' => '2026-01-02 03:04:05',
            'synced_at' => '2026-02-03 04:05:06',
        ])->fresh();

        $this->assertTrue($project->pinned);
        $this->assertFalse($project->hidden);
        $this->assertInstanceOf(CarbonInterface::class, $project->pushed_at);
        $this->assertSame('2026-01-02', $project->pushed_at->toDateString());
        $this->assertInstanceOf(CarbonInterface::class, $project->synced_at);
    }

    public function test_github_repo_must_be_unique(): void
    {
        Project::factory()->create(['github_repo' => 'same-repo']);

        $this->expectException(QueryException::class);

        Project::factory()->create(['github_repo' => 'same-repo']);
    }

    public function test_every_column_is_mass_assignable(): void
    {
        $columns = ['github_repo', 'title', 'description_it', 'type', 'scope', 'technologies',
            'extra_technologies', 'repo_url', 'live_url', 'stars', 'pushed_at', 'pinned', 'hidden', 'synced_at', 'project_group_id', 'course_id'];

        $this->assertEqualsCanonicalizing($columns, (new Project)->getFillable());
    }

    public function test_the_factory_builds_a_valid_project(): void
    {
        $project = Project::factory()->create();

        $this->assertContains($project->type, ProjectType::cases());
        $this->assertContains($project->scope, ProjectScope::cases());
        $this->assertStringContainsString($project->github_repo, $project->repo_url);
        $this->assertFalse($project->pinned);
        $this->assertFalse($project->hidden);
    }

    public function test_the_factory_states(): void
    {
        $this->assertTrue(Project::factory()->pinned()->create()->pinned);
        $this->assertTrue(Project::factory()->hidden()->create()->hidden);
    }

    public function test_the_factory_makes_unique_repos(): void
    {
        $repos = Project::factory()->count(25)->create()->pluck('github_repo');

        $this->assertCount(25, $repos->unique());
    }
}
