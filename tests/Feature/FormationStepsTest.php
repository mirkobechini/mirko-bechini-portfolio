<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use App\Filament\Resources\Courses\Pages\CreateCourse;
use App\Filament\Resources\Courses\Pages\EditCourse;
use App\Filament\Resources\Courses\Pages\ListCourses;
use App\Filament\Resources\FormationSteps\Pages\CreateFormationStep;
use App\Filament\Resources\FormationSteps\Pages\EditFormationStep;
use App\Filament\Resources\FormationSteps\Pages\ListFormationSteps;
use App\Models\Course;
use App\Models\FormationStep;
use App\Models\User;
use App\Support\PublicFormationSteps;
use Database\Seeders\FormationStepSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class FormationStepsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<array<string, mixed>>
     */
    private function steps(): array
    {
        return $this->getJson('/api/formation-steps')->assertOk()->json('data');
    }

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- API ----------

    public function test_the_api_returns_the_shape_the_formation_book_uses(): void
    {
        $step = FormationStep::factory()->create([
            'kind' => FormationStepKind::Focus,
            'title' => 'Learn Typescript',
            'description' => 'Corso Scrimba',
            'status' => FormationStepStatus::InProgress,
            'badge' => 'New Skill',
        ]);

        $this->assertSame([[
            'id' => $step->id,
            'kind' => 'focus',
            'title' => 'Learn Typescript',
            'description' => 'Corso Scrimba',
            'status' => 'inProgress',
            'badge' => 'New Skill',
        ]], $this->steps());
    }

    public function test_the_badge_can_be_empty(): void
    {
        FormationStep::factory()->create(['badge' => null]);

        $this->assertNull($this->steps()[0]['badge']);
    }

    public function test_hidden_steps_are_not_exposed_and_order_follows_the_position(): void
    {
        FormationStep::factory()->create(['title' => 'Secondo', 'position' => 2]);
        FormationStep::factory()->create(['title' => 'Primo', 'position' => 1]);
        FormationStep::factory()->create(['title' => 'Nascosto', 'hidden' => true]);

        $this->assertSame(['Primo', 'Secondo'], array_column($this->steps(), 'title'));
    }

    public function test_the_response_is_cacheable_and_supports_304(): void
    {
        FormationStep::factory()->create();
        $first = $this->getJson('/api/formation-steps')->assertOk();

        $this->assertStringContainsString('s-maxage=600', $first->headers->get('Cache-Control'));
        $this->getJson('/api/formation-steps', ['If-None-Match' => $first->headers->get('ETag')])->assertStatus(304);
    }

    public function test_changes_refresh_the_api(): void
    {
        $step = FormationStep::factory()->create(['title' => 'Prima', 'status' => FormationStepStatus::Next]);
        $this->assertSame('next', $this->steps()[0]['status']);

        $step->update(['title' => 'Dopo', 'status' => FormationStepStatus::InProgress]);
        $this->assertSame('Dopo', $this->steps()[0]['title']);
        $this->assertSame('inProgress', $this->steps()[0]['status']);

        $step->delete();
        $this->assertSame([], $this->steps());
    }

    // ---------- il Focus segue i corsi ----------

    public function test_courses_in_progress_or_on_hold_appear_in_the_focus_by_themselves(): void
    {
        Course::factory()->create(['course' => 'In corso', 'organization' => 'Boolean', 'description' => 'Descrizione corso', 'status' => CourseStatus::InProgress, 'period' => '05/2026 - current']);
        Course::factory()->create(['course' => 'In pausa', 'status' => CourseStatus::OnHold, 'period' => '03/2026 - current']);
        Course::factory()->create(['course' => 'Finito', 'status' => CourseStatus::Completed]);

        $steps = $this->steps();

        $this->assertSame(['In corso', 'In pausa'], array_column($steps, 'title'));
        $this->assertSame([
            'id' => $steps[0]['id'],
            'kind' => 'focus',
            'title' => 'In corso',
            'description' => 'Descrizione corso',
            'status' => 'inProgress',
            'badge' => 'Boolean',
        ], $steps[0]);
        $this->assertStringStartsWith('course-', $steps[0]['id']);
        $this->assertSame('onHold', $steps[1]['status']);
    }

    public function test_marking_a_course_completed_removes_it_from_the_focus_and_cache_is_refreshed(): void
    {
        $course = Course::factory()->create(['course' => 'Multistack', 'status' => CourseStatus::InProgress]);
        $this->assertSame(['Multistack'], array_column($this->steps(), 'title'));

        $course->update(['status' => CourseStatus::Completed]);
        $this->assertSame([], $this->steps());

        $course->update(['status' => CourseStatus::OnHold]);
        $this->assertSame(['Multistack'], array_column($this->steps(), 'title'));

        $course->update(['hidden' => true]);
        $this->assertSame([], $this->steps());
    }

    public function test_courses_in_the_focus_start_with_the_most_recent_one(): void
    {
        Course::factory()->create(['course' => 'Vecchio', 'status' => CourseStatus::InProgress, 'period' => '01/2025 - current']);
        Course::factory()->create(['course' => 'Nuovo', 'status' => CourseStatus::InProgress, 'period' => '09/2026 - current']);

        $this->assertSame(['Nuovo', 'Vecchio'], array_column($this->steps(), 'title'));
    }

    public function test_manual_focus_steps_follow_the_courses_and_completed_ones_leave_the_focus(): void
    {
        Course::factory()->create(['course' => 'Corso', 'status' => CourseStatus::InProgress]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Focus, 'title' => 'Passo mio', 'status' => FormationStepStatus::InProgress, 'position' => 1]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Focus, 'title' => 'Passo finito', 'status' => FormationStepStatus::Done, 'position' => 2]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Focus, 'title' => 'Passo nascosto', 'hidden' => true, 'position' => 3]);

        $this->assertSame(['Corso', 'Passo mio'], array_column($this->steps(), 'title'));
    }

    public function test_completed_steps_are_never_shown_in_either_column(): void
    {
        FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap, 'title' => 'Roadmap fatta', 'status' => FormationStepStatus::Done, 'position' => 1]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap, 'title' => 'Roadmap da fare', 'status' => FormationStepStatus::Next, 'position' => 2]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Focus, 'title' => 'Focus fatto', 'status' => FormationStepStatus::Done, 'position' => 1]);

        $this->assertSame(['Roadmap da fare'], array_column($this->steps(), 'title'));
    }

    public function test_marking_a_roadmap_step_completed_removes_it_and_reopening_brings_it_back(): void
    {
        $step = FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap, 'title' => 'Passo', 'status' => FormationStepStatus::Next]);
        $this->assertSame(['Passo'], array_column($this->steps(), 'title'));

        $step->update(['status' => FormationStepStatus::Done]);
        $this->assertSame([], $this->steps());

        $step->update(['status' => FormationStepStatus::InProgress]);
        $this->assertSame(['Passo'], array_column($this->steps(), 'title'));
    }

    public function test_a_long_course_description_is_trimmed_in_the_focus_but_not_in_the_courses_api(): void
    {
        $long = str_repeat('Descrizione molto lunga di un corso. ', 12);
        Course::factory()->create(['course' => 'Corso lungo', 'description' => $long, 'status' => CourseStatus::InProgress]);

        $focus = $this->steps()[0]['description'];

        $this->assertLessThanOrEqual(PublicFormationSteps::COURSE_DESCRIPTION_LIMIT + 1, mb_strlen($focus));
        $this->assertStringEndsWith('…', $focus);
        $this->assertStringStartsWith('Descrizione molto lunga', $focus);
        $this->assertSame($long, $this->getJson('/api/education')->json('data.0.description')); // intera altrove
    }

    public function test_a_short_course_description_is_left_as_it_is(): void
    {
        Course::factory()->create(['description' => 'Breve.', 'status' => CourseStatus::InProgress]);

        $this->assertSame('Breve.', $this->steps()[0]['description']);
    }

    public function test_manual_step_descriptions_are_not_trimmed(): void
    {
        $long = str_repeat('Testo del passo scritto da me. ', 12);
        FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap, 'description' => $long]);

        $this->assertSame($long, $this->steps()[0]['description']);
    }

    public function test_a_manual_focus_step_with_the_same_title_as_a_course_is_not_repeated(): void
    {
        Course::factory()->create(['course' => 'Multistack AI Developer', 'status' => CourseStatus::InProgress]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Focus, 'title' => 'multistack ai developer', 'status' => FormationStepStatus::InProgress]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap, 'title' => 'Multistack AI Developer']);

        $titles = array_column($this->steps(), 'kind', 'id');

        $this->assertSame(['focus', 'roadmap'], array_values($titles)); // il passo a mano del focus non si ripete, la roadmap sì
    }

    public function test_the_course_status_shows_in_the_courses_api_too(): void
    {
        Course::factory()->create(['status' => CourseStatus::OnHold]);

        $this->assertSame('onHold', $this->getJson('/api/education')->json('data.0.status'));
    }

    public function test_the_admin_can_change_the_course_status_from_the_row_and_the_form(): void
    {
        $this->actAsAdmin();
        $course = Course::factory()->create(['status' => CourseStatus::InProgress, 'period' => '01/2026 - current']);

        Livewire::test(ListCourses::class)
            ->call('updateTableColumnState', 'status', $course->getKey(), 'done');

        $this->assertSame(CourseStatus::Completed, $course->fresh()->status);
        $this->assertSame([], $this->steps());

        Livewire::test(EditCourse::class, ['record' => $course->getKey()])
            ->fillForm(['status' => 'inventato'])
            ->call('save')
            ->assertHasFormErrors(['status']);
    }

    public function test_new_courses_default_to_in_progress_in_the_form(): void
    {
        $this->actAsAdmin();

        Livewire::test(CreateCourse::class)
            ->assertFormSet(['status' => CourseStatus::InProgress]);
    }

    /**
     * Il libro legge questi campi (stessa forma del fallback statico formationStepsData.js).
     */
    public function test_the_fields_match_the_static_fallback(): void
    {
        $js = file_get_contents(base_path('resources/js/src/features/modals/library/formationStepsData.js'));
        preg_match('/const formationStepsData = \[\s*\{(.*?)\n    \},/s', $js, $block);
        preg_match_all('/^\s{8}([a-zA-Z]+):/m', $block[1] ?? '', $keys);

        FormationStep::factory()->create();

        $this->assertNotEmpty($keys[1], 'Non riesco a leggere i campi di formationStepsData.js');
        $this->assertEqualsCanonicalizing($keys[1], array_keys($this->steps()[0]));
    }

    /**
     * Stati e colonne sono valori fissi: il sito ha una classe CSS e un'etichetta per ognuno.
     */
    public function test_every_status_has_a_css_class_and_a_label_in_the_site(): void
    {
        $css = file_get_contents(base_path('resources/js/src/features/modals/library/FormationView.module.css'));
        $jsx = file_get_contents(base_path('resources/js/src/features/modals/library/FormationView.jsx'));

        foreach (FormationStepStatus::cases() as $status) {
            $this->assertStringContainsString('.status-'.$status->value.' {', $css, $status->value);
            $this->assertMatchesRegularExpression('/\b'.$status->value.':/', $jsx, $status->value);
        }
    }

    // ---------- seeder ----------

    public function test_the_seeder_imports_the_roadmap_steps_and_is_repeatable(): void
    {
        $this->seed(FormationStepSeeder::class);
        FormationStep::where('title', 'Learn Angular')->update(['status' => 'done']);
        $this->seed(FormationStepSeeder::class);

        $this->assertSame(3, FormationStep::count());
        $this->assertSame(0, FormationStep::where('kind', 'focus')->count()); // il Focus arriva dai corsi
        $this->assertSame(3, FormationStep::where('kind', 'roadmap')->count());
        $this->assertSame(FormationStepStatus::Done, FormationStep::where('title', 'Learn Angular')->first()->status);
    }

    // ---------- pannello ----------

    public function test_the_admin_can_create_a_step_which_goes_to_the_end_of_its_column(): void
    {
        $this->actAsAdmin();
        FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap, 'position' => 4]);
        FormationStep::factory()->create(['kind' => FormationStepKind::Focus, 'position' => 9]);

        Livewire::test(CreateFormationStep::class)
            ->fillForm([
                'kind' => 'roadmap',
                'status' => 'next',
                'title' => 'Nuovo passo',
                'description' => 'Descrizione',
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $step = FormationStep::where('title', 'Nuovo passo')->firstOrFail();
        $this->assertSame(5, $step->position);
        $this->assertSame(FormationStepKind::Roadmap, $step->kind);
    }

    public function test_the_admin_can_list_and_edit_steps_and_change_the_status_from_the_row(): void
    {
        $this->actAsAdmin();
        $step = FormationStep::factory()->create(['status' => FormationStepStatus::Next]);

        Livewire::test(ListFormationSteps::class)
            ->assertCanSeeTableRecords([$step])
            ->call('updateTableColumnState', 'status', $step->getKey(), 'inProgress');

        $this->assertSame(FormationStepStatus::InProgress, $step->fresh()->status);

        Livewire::test(EditFormationStep::class, ['record' => $step->getKey()])
            ->fillForm(['title' => 'Cambiato'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Cambiato', $step->fresh()->title);
    }

    public function test_the_list_can_be_filtered_by_column(): void
    {
        $this->actAsAdmin();
        $focus = FormationStep::factory()->create(['kind' => FormationStepKind::Focus]);
        $roadmap = FormationStep::factory()->create(['kind' => FormationStepKind::Roadmap]);

        Livewire::test(ListFormationSteps::class)
            ->filterTable('kind', 'focus')
            ->assertCanSeeTableRecords([$focus])
            ->assertCanNotSeeTableRecords([$roadmap]);
    }

    public function test_required_fields_and_known_values_are_validated(): void
    {
        $this->actAsAdmin();

        Livewire::test(CreateFormationStep::class)
            ->fillForm(['kind' => null, 'status' => null, 'title' => '', 'description' => ''])
            ->call('create')
            ->assertHasFormErrors(['kind' => 'required', 'status' => 'required', 'title' => 'required', 'description' => 'required']);

        Livewire::test(CreateFormationStep::class)
            ->fillForm(['kind' => 'inventata', 'status' => 'inventato', 'title' => 'T', 'description' => 'D'])
            ->call('create')
            ->assertHasFormErrors(['kind', 'status']);

        $this->assertSame(0, FormationStep::count());
    }

    public function test_the_page_requires_an_admin(): void
    {
        $this->get('/admin/formation-steps')->assertRedirect();
    }
}
