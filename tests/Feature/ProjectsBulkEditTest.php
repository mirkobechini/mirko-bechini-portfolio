<?php

namespace Tests\Feature;

use App\Enums\ProjectScope;
use App\Enums\ProjectType;
use App\Filament\Resources\Projects\Pages\ListProjects;
use App\Models\Course;
use App\Models\Project;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * Modifica veloce di tanti progetti insieme (revisione dei progetti arrivati dalla sincronizzazione).
 */
class ProjectsBulkEditTest extends TestCase
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

    // ---------- azioni di gruppo ----------

    public function test_bulk_set_type_only_touches_the_selected_projects(): void
    {
        $selected = Project::factory()->count(3)->create(['type' => ProjectType::Fullstack]);
        $untouched = Project::factory()->create(['type' => ProjectType::Fullstack]);

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setType', $selected, data: ['type' => 'backend']);

        $this->assertSame(3, Project::where('type', 'backend')->count());
        $this->assertSame(ProjectType::Fullstack, $untouched->fresh()->type);
    }

    public function test_bulk_set_scope_only_touches_the_selected_projects(): void
    {
        $selected = Project::factory()->count(2)->create(['scope' => ProjectScope::Personal]);
        $untouched = Project::factory()->create(['scope' => ProjectScope::Personal]);

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setScope', $selected, data: ['scope' => 'work']);

        $this->assertSame(2, Project::where('scope', 'work')->count());
        $this->assertSame(ProjectScope::Personal, $untouched->fresh()->scope);
    }

    public function test_bulk_type_and_scope_reject_unknown_values_and_require_a_choice(): void
    {
        $projects = Project::factory()->count(2)->create();

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setType', $projects, data: [])
            ->assertHasTableBulkActionErrors(['type' => 'required']);

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setScope', $projects, data: ['scope' => 'inventato'])
            ->assertHasTableBulkActionErrors(['scope']);

        $this->assertSame(0, Project::where('scope', 'inventato')->count());
    }

    public function test_bulk_assign_course_only_touches_the_selected_projects_and_can_be_cleared(): void
    {
        $course = Course::factory()->create();
        $selected = Project::factory()->count(3)->create();
        $untouched = Project::factory()->create();

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('assignCourse', $selected, data: ['course_id' => $course->id]);

        $this->assertSame(3, Project::where('course_id', $course->id)->count());
        $this->assertNull($untouched->fresh()->course_id);

        Livewire::test(ListProjects::class)->callTableBulkAction('clearCourse', $selected);

        $this->assertSame(0, Project::where('course_id', $course->id)->count());
    }

    public function test_bulk_assign_course_requires_a_course(): void
    {
        $projects = Project::factory()->count(2)->create();

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('assignCourse', $projects, data: [])
            ->assertHasTableBulkActionErrors(['course_id' => 'required']);
    }

    public function test_bulk_changes_do_not_touch_the_github_fields_or_the_description(): void
    {
        $course = Course::factory()->create();
        $project = Project::factory()->create([
            'description_it' => 'Mia descrizione',
            'stars' => 12,
            'technologies' => ['PHP'],
            'hidden' => true,
            'pinned' => true,
        ]);

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setType', [$project], data: ['type' => 'backend'])
            ->callTableBulkAction('assignCourse', [$project], data: ['course_id' => $course->id]);

        $project->refresh();
        $this->assertSame('Mia descrizione', $project->description_it);
        $this->assertSame(12, $project->stars);
        $this->assertSame(['PHP'], $project->technologies);
        $this->assertTrue($project->hidden);
        $this->assertTrue($project->pinned);
    }

    public function test_bulk_changes_refresh_the_public_api(): void
    {
        $course = Course::factory()->create(['course' => 'Master Laravel']);
        $project = Project::factory()->create(['type' => ProjectType::Frontend, 'course_id' => null]);
        $this->getJson('/api/projects')->assertJsonPath('data.0.type', 'frontend')->assertJsonPath('data.0.course', null);

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setType', [$project], data: ['type' => 'backend'])
            ->callTableBulkAction('assignCourse', [$project], data: ['course_id' => $course->id]);

        $this->getJson('/api/projects')->assertJsonPath('data.0.type', 'backend')->assertJsonPath('data.0.course', 'Master Laravel');
    }

    public function test_the_bulk_edit_works_on_many_projects_at_once(): void
    {
        $course = Course::factory()->create();
        $projects = Project::factory()->count(73)->create(['type' => ProjectType::Fullstack]);

        Livewire::test(ListProjects::class)
            ->callTableBulkAction('setType', $projects, data: ['type' => 'frontend'])
            ->callTableBulkAction('assignCourse', $projects, data: ['course_id' => $course->id]);

        $this->assertSame(73, Project::where('type', 'frontend')->where('course_id', $course->id)->count());
    }

    // ---------- menu nelle righe ----------

    public function test_type_scope_and_course_can_be_changed_from_the_row(): void
    {
        $course = Course::factory()->create();
        $project = Project::factory()->create(['type' => ProjectType::Fullstack, 'scope' => ProjectScope::Personal]);

        Livewire::test(ListProjects::class)
            ->call('updateTableColumnState', 'type', $project->getKey(), 'backend')
            ->call('updateTableColumnState', 'scope', $project->getKey(), 'work')
            ->call('updateTableColumnState', 'course_id', $project->getKey(), $course->id);

        $project->refresh();
        $this->assertSame(ProjectType::Backend, $project->type);
        $this->assertSame(ProjectScope::Work, $project->scope);
        $this->assertSame($course->id, $project->course_id);
    }

    public function test_the_row_menus_only_offer_the_known_values(): void
    {
        $project = Project::factory()->create(['type' => ProjectType::Fullstack]);

        Livewire::test(ListProjects::class)
            ->call('updateTableColumnState', 'type', $project->getKey(), 'inventato');

        $this->assertSame(ProjectType::Fullstack, $project->fresh()->type);
    }

    // ---------- filtri per la revisione ----------

    public function test_the_to_review_filter_shows_only_projects_without_a_description(): void
    {
        $synced = Project::factory()->create(['description_it' => null]);
        $blank = Project::factory()->create(['description_it' => '']);
        $reviewed = Project::factory()->create(['description_it' => 'Descritto']);

        Livewire::test(ListProjects::class)
            ->filterTable('to_review', true)
            ->assertCanSeeTableRecords([$synced, $blank])
            ->assertCanNotSeeTableRecords([$reviewed]);
    }

    public function test_the_course_filters(): void
    {
        $course = Course::factory()->create();
        $with = Project::factory()->create(['course_id' => $course->id]);
        $without = Project::factory()->create(['course_id' => null]);

        Livewire::test(ListProjects::class)
            ->filterTable('without_course', true)
            ->assertCanSeeTableRecords([$without])
            ->assertCanNotSeeTableRecords([$with]);

        Livewire::test(ListProjects::class)
            ->filterTable('course_id', $course->id)
            ->assertCanSeeTableRecords([$with])
            ->assertCanNotSeeTableRecords([$without]);
    }

    public function test_the_list_shows_50_projects_per_page_by_default(): void
    {
        Project::factory()->count(60)->create();

        $table = Livewire::test(ListProjects::class)->instance();

        $this->assertSame(60, $table->getAllTableRecordsCount());
        $this->assertCount(50, $table->getTableRecords()); // una pagina
    }
}
