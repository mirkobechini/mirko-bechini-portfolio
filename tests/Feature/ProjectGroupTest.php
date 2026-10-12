<?php

namespace Tests\Feature;

use App\Filament\Resources\ProjectGroups\Pages\CreateProjectGroup;
use App\Filament\Resources\ProjectGroups\Pages\EditProjectGroup;
use App\Filament\Resources\ProjectGroups\Pages\ListProjectGroups;
use App\Models\Project;
use App\Models\ProjectGroup;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ProjectGroupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel('admin');

        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- modello e relazioni ----------

    public function test_a_project_belongs_to_at_most_one_group(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Cliente A']);
        $project = Project::factory()->create(['project_group_id' => $group->id]);
        $free = Project::factory()->create();

        $this->assertSame('Cliente A', $project->group->name);
        $this->assertNull($free->group);
        $this->assertTrue($group->projects->contains($project));
        $this->assertFalse($group->projects->contains($free));
    }

    public function test_a_group_name_must_be_unique(): void
    {
        ProjectGroup::factory()->create(['name' => 'Cliente A']);

        $this->expectException(QueryException::class);

        ProjectGroup::factory()->create(['name' => 'Cliente A']);
    }

    public function test_deleting_a_group_keeps_its_projects_without_a_group(): void
    {
        $group = ProjectGroup::factory()->create();
        $project = Project::factory()->create(['project_group_id' => $group->id]);

        $group->delete();

        $project = $project->fresh();
        $this->assertNotNull($project);
        $this->assertNull($project->project_group_id);
    }

    public function test_a_project_cannot_point_to_a_group_that_does_not_exist(): void
    {
        $this->expectException(QueryException::class);

        Project::factory()->create(['project_group_id' => 9999]);
    }

    // ---------- pagina Raggruppamenti ----------

    public function test_the_groups_page_is_reachable_by_an_admin(): void
    {
        $this->get('/admin/project-groups')->assertOk();
    }

    public function test_the_groups_list_shows_the_name_and_the_number_of_projects(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Cliente A']);
        Project::factory()->count(3)->create(['project_group_id' => $group->id]);
        Project::factory()->create();

        Livewire::test(ListProjectGroups::class)
            ->assertCanSeeTableRecords([$group])
            ->assertTableColumnStateSet('projects_count', 3, $group);
    }

    public function test_a_group_can_be_created(): void
    {
        Livewire::test(CreateProjectGroup::class)
            ->fillForm(['name' => 'Azienda B', 'description' => 'Sito vetrina'])
            ->call('create')
            ->assertHasNoFormErrors();

        $group = ProjectGroup::where('name', 'Azienda B')->firstOrFail();
        $this->assertSame('Sito vetrina', $group->description);
    }

    public function test_a_duplicate_or_empty_name_is_rejected_with_a_form_error(): void
    {
        ProjectGroup::factory()->create(['name' => 'Cliente A']);

        Livewire::test(CreateProjectGroup::class)
            ->fillForm(['name' => 'Cliente A'])
            ->call('create')
            ->assertHasFormErrors(['name' => 'unique']);

        Livewire::test(CreateProjectGroup::class)
            ->fillForm(['name' => ''])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);
    }

    public function test_a_group_can_be_renamed_keeping_its_projects(): void
    {
        $group = ProjectGroup::factory()->create(['name' => 'Vecchio nome']);
        $project = Project::factory()->create(['project_group_id' => $group->id]);

        Livewire::test(EditProjectGroup::class, ['record' => $group->getRouteKey()])
            ->fillForm(['name' => 'Nuovo nome'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Nuovo nome', $group->fresh()->name);
        $this->assertSame($group->id, $project->fresh()->project_group_id);
    }

    public function test_a_group_can_be_deleted_from_the_list_and_its_projects_stay(): void
    {
        $group = ProjectGroup::factory()->create();
        $project = Project::factory()->create(['project_group_id' => $group->id]);

        Livewire::test(ListProjectGroups::class)
            ->callAction(TestAction::make('delete')->table($group));

        $this->assertNull(ProjectGroup::find($group->id));
        $this->assertNull($project->fresh()->project_group_id);
    }

    public function test_a_non_admin_cannot_reach_the_groups_page(): void
    {
        auth()->logout();
        $this->actingAs(User::factory()->create());

        $this->get('/admin/project-groups')->assertForbidden();
    }
}
