<?php

namespace Tests\Feature;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Filament\Resources\Projects\Pages\CreateProject;
use App\Filament\Resources\Projects\Pages\EditProject;
use App\Filament\Resources\Projects\Pages\ListProjects;
use App\Models\Project;
use App\Models\ProjectGroup;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
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

    // ---------- modifica veloce dall'elenco ----------

    public function test_hidden_and_pinned_can_be_toggled_from_the_list_row(): void
    {
        $project = Project::factory()->create(['hidden' => false, 'pinned' => false]);

        Livewire::test(ListProjects::class)
            ->call('updateTableColumnState', 'hidden', $project->getKey(), true)
            ->call('updateTableColumnState', 'pinned', $project->getKey(), true);

        $project = $project->fresh();
        $this->assertTrue($project->hidden);
        $this->assertTrue($project->pinned);
    }

    public function test_bulk_hide_and_show_only_touch_the_selected_projects(): void
    {
        $selected = Project::factory()->count(2)->create(['hidden' => false]);
        $untouched = Project::factory()->create(['hidden' => false]);

        Livewire::test(ListProjects::class)->callTableBulkAction('hide', $selected);

        $this->assertSame(2, Project::where('hidden', true)->count());
        $this->assertFalse($untouched->fresh()->hidden);

        Livewire::test(ListProjects::class)->callTableBulkAction('show', $selected);

        $this->assertSame(0, Project::where('hidden', true)->count());
    }

    public function test_bulk_pin_and_unpin_only_touch_the_selected_projects(): void
    {
        $selected = Project::factory()->count(2)->create(['pinned' => false]);
        $untouched = Project::factory()->create(['pinned' => false]);

        Livewire::test(ListProjects::class)->callTableBulkAction('pin', $selected);

        $this->assertSame(2, Project::where('pinned', true)->count());
        $this->assertFalse($untouched->fresh()->pinned);

        Livewire::test(ListProjects::class)->callTableBulkAction('unpin', $selected);

        $this->assertSame(0, Project::where('pinned', true)->count());
    }

    public function test_the_bulk_actions_do_not_change_anything_else(): void
    {
        $project = Project::factory()->create([
            'title' => 'Intatto',
            'description_it' => 'Non toccare',
            'extra_technologies' => ['AI'],
        ]);

        Livewire::test(ListProjects::class)->callTableBulkAction('hide', [$project]);

        $project = $project->fresh();
        $this->assertSame('Intatto', $project->title);
        $this->assertSame('Non toccare', $project->description_it);
        $this->assertSame(['AI'], $project->extra_technologies);
    }

    // ---------- raggruppamenti ----------

    public function test_a_project_can_be_assigned_to_a_group_from_the_edit_form(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Cliente A']);
        $project = Project::factory()->create();

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm(['project_group_id' => $group->id])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame($group->id, $project->fresh()->project_group_id);
    }

    public function test_the_group_can_be_removed_from_a_project(): void
    {
        $group = ProjectGroup::factory()->create();
        $project = Project::factory()->create(['project_group_id' => $group->id]);

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->fillForm(['project_group_id' => null])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertNull($project->fresh()->project_group_id);
    }

    public function test_a_new_group_can_be_created_from_the_project_form(): void
    {
        $project = Project::factory()->create();

        Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->callAction(TestAction::make('createOption')->schemaComponent('project_group_id', schema: 'form'), data: [
                'name' => 'Azienda B',
            ]);

        $group = ProjectGroup::where('name', 'Azienda B')->first();
        $this->assertNotNull($group);
    }

    public function test_the_group_created_from_the_form_is_selected_and_saved_with_the_project(): void
    {
        $project = Project::factory()->create();

        $page = Livewire::test(EditProject::class, ['record' => $project->getRouteKey()])
            ->callAction(TestAction::make('createOption')->schemaComponent('project_group_id', schema: 'form'), data: [
                'name' => 'Azienda B',
            ]);

        $group = ProjectGroup::where('name', 'Azienda B')->firstOrFail();
        $page->assertFormSet(['project_group_id' => $group->id])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame($group->id, $project->fresh()->project_group_id);
    }

    public function test_the_list_shows_the_group_and_can_be_filtered_by_it(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Cliente A']);
        $inside = Project::factory()->create(['project_group_id' => $group->id]);
        $outside = Project::factory()->create();

        Livewire::test(ListProjects::class)
            ->assertTableColumnStateSet('group.name', 'Cliente A', $inside)
            ->filterTable('project_group_id', $group->id)
            ->assertCanSeeTableRecords([$inside])
            ->assertCanNotSeeTableRecords([$outside]);
    }

    public function test_the_bulk_assign_action_only_touches_the_selected_projects(): void
    {
        $group = ProjectGroup::factory()->create();
        $selected = Project::factory()->count(2)->create();
        $untouched = Project::factory()->create();

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('assignGroup', $selected, data: ['project_group_id' => $group->id]);

        $this->assertSame(2, Project::where('project_group_id', $group->id)->count());
        $this->assertNull($untouched->fresh()->project_group_id);
    }

    public function test_the_bulk_assign_action_requires_a_group(): void
    {
        $projects = Project::factory()->count(2)->create();

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('assignGroup', $projects, data: [])
            ->assertHasTableBulkActionErrors(['project_group_id' => 'required']);
    }

    public function test_the_bulk_clear_action_removes_the_group_only_from_the_selected_projects(): void
    {
        $group = ProjectGroup::factory()->create();
        $selected = Project::factory()->count(2)->create(['project_group_id' => $group->id]);
        $kept = Project::factory()->create(['project_group_id' => $group->id]);

        Livewire::test(ListProjects::class)->callTableBulkAction('clearGroup', $selected);

        $this->assertSame(1, Project::where('project_group_id', $group->id)->count());
        $this->assertSame($group->id, $kept->fresh()->project_group_id);
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
                'type' => ProjectType::Backend,
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
        $this->assertSame(ProjectType::Frontend, $project->type);
        $this->assertSame(ProjectScope::Work, $project->scope);
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
        $this->assertSame(ProjectType::Fullstack, $project->type);
        $this->assertSame(ProjectScope::Personal, $project->scope);
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
