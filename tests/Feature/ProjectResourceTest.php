<?php

namespace Tests\Feature;

use App\Filament\Resources\Projects\Pages\CreateProject;
use App\Filament\Resources\Projects\Pages\EditProject;
use App\Filament\Resources\Projects\Pages\ListProjects;
use App\Models\Project;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ProjectResourceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel('admin');
        $this->actingAs($this->adminWithTwoFactor());
    }

    private function adminWithTwoFactor(): User
    {
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');

        return $admin;
    }

    // ---------- accesso ----------

    public function test_the_projects_page_is_reachable_by_an_admin_with_two_factor(): void
    {
        $this->get('/admin/projects')->assertOk();
    }

    public function test_a_non_admin_cannot_reach_the_projects_page(): void
    {
        auth()->logout();
        $this->actingAs(User::factory()->create());

        $this->get('/admin/projects')->assertForbidden();
    }

    // ---------- elenco ----------

    public function test_the_list_shows_the_projects(): void
    {
        $projects = Project::factory()->count(3)->create();

        Livewire::test(ListProjects::class)
            ->assertCanSeeTableRecords($projects);
    }

    public function test_the_list_can_be_filtered_by_type(): void
    {
        $frontend = Project::factory()->create(['type' => 'frontend']);
        $backend = Project::factory()->create(['type' => 'backend']);

        Livewire::test(ListProjects::class)
            ->filterTable('type', 'frontend')
            ->assertCanSeeTableRecords([$frontend])
            ->assertCanNotSeeTableRecords([$backend]);
    }

    public function test_the_list_can_be_searched_by_title_and_by_repo_name(): void
    {
        $match = Project::factory()->create(['title' => 'Gods Backoffice', 'github_repo' => 'gods-backoffice']);
        $other = Project::factory()->create(['title' => 'Quiz', 'github_repo' => 'quizzical']);

        Livewire::test(ListProjects::class)
            ->searchTable('gods-backoffice')
            ->assertCanSeeTableRecords([$match])
            ->assertCanNotSeeTableRecords([$other]);
    }

    public function test_projects_cannot_be_deleted_from_the_panel(): void
    {
        $project = Project::factory()->create();

        Livewire::test(ListProjects::class)
            ->assertTableBulkActionDoesNotExist('delete');

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->assertActionDoesNotExist('delete');
    }

    // ---------- modifica ----------

    public function test_the_edit_form_is_filled_with_the_project_data(): void
    {
        $project = Project::factory()->create([
            'title' => 'Titolo',
            'description_it' => 'Descrizione',
            'type' => 'backend',
            'extra_technologies' => ['AI'],
        ]);

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->assertFormSet([
                'title' => 'Titolo',
                'description_it' => 'Descrizione',
                'type' => 'backend',
                'extra_technologies' => ['AI'],
            ]);
    }

    public function test_the_panel_fields_can_be_saved(): void
    {
        $project = Project::factory()->create();

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm([
                'title' => 'Nuovo titolo',
                'description_it' => 'Nuova descrizione',
                'type' => 'frontend',
                'scope' => 'work',
                'live_url' => 'https://example.com',
                'extra_technologies' => ['AI', 'Figma'],
                'pinned' => true,
                'hidden' => true,
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $project = $project->fresh();
        $this->assertSame('Nuovo titolo', $project->title);
        $this->assertSame('Nuova descrizione', $project->description_it);
        $this->assertSame('frontend', $project->type);
        $this->assertSame('work', $project->scope);
        $this->assertSame('https://example.com', $project->live_url);
        $this->assertSame(['AI', 'Figma'], $project->extra_technologies);
        $this->assertTrue($project->pinned);
        $this->assertTrue($project->hidden);
    }

    public function test_the_github_fields_are_never_overwritten_by_the_panel(): void
    {
        $project = Project::factory()->create([
            'github_repo' => 'repo-originale',
            'repo_url' => 'https://github.com/mirkobechini/repo-originale',
            'technologies' => ['PHP', 'Laravel'],
            'stars' => 7,
        ]);

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm([
                'github_repo' => 'altro-repo',
                'repo_url' => 'https://github.com/mirkobechini/altro-repo',
                'technologies' => ['COBOL'],
                'stars' => 999,
                'title' => 'Cambiato dal pannello',
            ])
            ->call('save');

        $project = $project->fresh();
        $this->assertSame('Cambiato dal pannello', $project->title);
        $this->assertSame('repo-originale', $project->github_repo);
        $this->assertSame('https://github.com/mirkobechini/repo-originale', $project->repo_url);
        $this->assertSame(['PHP', 'Laravel'], $project->technologies);
        $this->assertSame(7, $project->stars);
    }

    public function test_type_and_scope_only_accept_the_known_values(): void
    {
        $project = Project::factory()->create();

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm(['type' => 'frontendd', 'scope' => 'boh'])
            ->call('save')
            ->assertHasFormErrors(['type', 'scope']);
    }

    public function test_the_title_is_required(): void
    {
        $project = Project::factory()->create();

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm(['title' => ''])
            ->call('save')
            ->assertHasFormErrors(['title' => 'required']);
    }

    public function test_the_live_url_must_be_a_url(): void
    {
        $project = Project::factory()->create();

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm(['live_url' => 'non-un-indirizzo'])
            ->call('save')
            ->assertHasFormErrors(['live_url']);
    }

    // ---------- creazione ----------

    public function test_a_project_can_be_created_from_the_panel_with_the_defaults(): void
    {
        Livewire::test(CreateProject::class)
            ->fillForm([
                'title' => 'Nuovo progetto',
                'github_repo' => 'nuovo-progetto',
                'repo_url' => 'https://github.com/mirkobechini/nuovo-progetto',
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $project = Project::where('github_repo', 'nuovo-progetto')->firstOrFail();
        $this->assertSame('Nuovo progetto', $project->title);
        $this->assertSame('fullstack', $project->type);
        $this->assertSame('personal', $project->scope);
        $this->assertFalse($project->pinned);
        $this->assertFalse($project->hidden);
        $this->assertSame(0, $project->stars);
    }

    public function test_a_repo_that_already_exists_is_rejected_with_a_form_error(): void
    {
        Project::factory()->create(['github_repo' => 'gia-presente']);

        Livewire::test(CreateProject::class)
            ->fillForm([
                'title' => 'Doppione',
                'github_repo' => 'gia-presente',
                'repo_url' => 'https://github.com/mirkobechini/gia-presente',
            ])
            ->call('create')
            ->assertHasFormErrors(['github_repo' => 'unique']);

        $this->assertSame(1, Project::where('github_repo', 'gia-presente')->count());
    }

    public function test_the_repo_name_title_and_url_are_required_on_creation(): void
    {
        Livewire::test(CreateProject::class)
            ->fillForm(['title' => '', 'github_repo' => '', 'repo_url' => ''])
            ->call('create')
            ->assertHasFormErrors(['title' => 'required', 'github_repo' => 'required', 'repo_url' => 'required']);
    }
}
