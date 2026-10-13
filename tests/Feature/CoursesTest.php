<?php

namespace Tests\Feature;

use App\Filament\Resources\Courses\Pages\CreateCourse;
use App\Filament\Resources\Courses\Pages\EditCourse;
use App\Filament\Resources\Courses\Pages\ListCourses;
use App\Models\Course;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use App\Support\PublicCourses;
use Database\Seeders\CourseSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use Tests\TestCase;

class CoursesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<array<string, mixed>>
     */
    private function courses(): array
    {
        return $this->getJson('/api/education')->assertOk()->json('data');
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
        $course = Course::factory()->create([
            'course' => 'LEARN REACT',
            'description' => 'Corso intensivo',
            'certificate' => '/modals/certifications/react.webp',
            'organization' => 'Scrimba',
            'organization_url' => 'https://scrimba.com',
            'period' => '03/2026 - 03/2026',
            'skills' => ['React'],
            'highlights' => ['Hooks'],
            'modules' => [['title' => 'Basics', 'description' => 'JSX', 'skills' => ['React']]],
        ]);
        Project::factory()->create(['title' => 'Tenzies', 'course_id' => $course->id]);

        $this->assertSame([[
            'id' => $course->id,
            'course' => 'LEARN REACT',
            'description' => 'Corso intensivo',
            'certificate' => '/modals/certifications/react.webp',
            'organization' => 'Scrimba',
            'organizationUrl' => 'https://scrimba.com',
            'period' => '03/2026 - 03/2026',
            'status' => 'done',
            'skills' => ['React'],
            'highlights' => ['Hooks'],
            'modules' => [['title' => 'Basics', 'description' => 'JSX', 'skillsModules' => ['React']]],
            'projects' => ['Tenzies'],
        ]], $this->courses());
    }

    public function test_missing_optional_values_become_empty_strings_and_lists(): void
    {
        Course::factory()->create(['certificate' => null, 'organization_url' => null, 'skills' => null, 'highlights' => null, 'modules' => null]);

        $course = $this->courses()[0];

        $this->assertSame('', $course['certificate']);
        $this->assertSame('', $course['organizationUrl']);
        $this->assertSame([], $course['skills']);
        $this->assertSame([], $course['highlights']);
        $this->assertSame([], $course['modules']);
        $this->assertSame([], $course['projects']);
    }

    public function test_hidden_courses_and_hidden_projects_are_not_exposed(): void
    {
        $visible = Course::factory()->create(['course' => 'Visibile']);
        Course::factory()->create(['course' => 'Nascosto', 'hidden' => true]);
        Project::factory()->create(['title' => 'Pubblico', 'course_id' => $visible->id]);
        Project::factory()->create(['title' => 'Segreto', 'course_id' => $visible->id, 'hidden' => true]);

        $courses = $this->courses();

        $this->assertSame(['Visibile'], array_column($courses, 'course'));
        $this->assertSame(['Pubblico'], $courses[0]['projects']);
    }

    public function test_courses_are_shown_from_the_most_recent_to_the_oldest(): void
    {
        Course::factory()->create(['course' => 'Vecchio', 'period' => '05/2025 - 02/2026']);
        Course::factory()->create(['course' => 'Recente', 'period' => '08/2026 - in corso']);
        Course::factory()->create(['course' => 'Medio', 'period' => '03/2026 - current']);

        $this->assertSame(['Recente', 'Medio', 'Vecchio'], array_column($this->courses(), 'course'));
    }

    public function test_courses_starting_in_the_same_month_show_the_one_added_later_first(): void
    {
        Course::factory()->create(['course' => 'Primo inserito', 'period' => '03/2026 - 03/2026']);
        Course::factory()->create(['course' => 'Secondo inserito', 'period' => '03/2026 - current']);

        $this->assertSame(['Secondo inserito', 'Primo inserito'], array_column($this->courses(), 'course'));
    }

    public function test_courses_without_a_readable_year_go_last(): void
    {
        Course::factory()->create(['course' => 'Senza data', 'period' => 'da definire']);
        Course::factory()->create(['course' => 'Con data', 'period' => '01/2020 - 02/2020']);

        $this->assertSame(['Con data', 'Senza data'], array_column($this->courses(), 'course'));
    }

    public function test_the_start_is_read_from_the_period_text(): void
    {
        $this->assertSame('2025-05-01', Course::startOfPeriod('05/2025 - 02/2026')->toDateString());
        $this->assertSame('2026-03-01', Course::startOfPeriod('3/2026 - current')->toDateString());
        $this->assertSame('2024-01-01', Course::startOfPeriod('2024')->toDateString()); // solo l'anno
        $this->assertSame('2026-08-01', Course::startOfPeriod('08/2026 - in corso')->toDateString());
        $this->assertNull(Course::startOfPeriod('da definire'));
        $this->assertNull(Course::startOfPeriod('13/2026')); // mese impossibile
        $this->assertNull(Course::startOfPeriod(null));
    }

    public function test_changing_the_period_reorders_the_courses(): void
    {
        $a = Course::factory()->create(['course' => 'A', 'period' => '01/2024 - 02/2024']);
        Course::factory()->create(['course' => 'B', 'period' => '01/2025 - 02/2025']);
        $this->assertSame(['B', 'A'], array_column($this->courses(), 'course'));

        $a->update(['period' => '01/2027 - current']);

        $this->assertSame(['A', 'B'], array_column($this->courses(), 'course'));
        $this->assertSame('2027-01-01', $a->fresh()->started_at->toDateString());
    }

    public function test_the_response_is_cacheable_and_supports_304(): void
    {
        Course::factory()->create();
        $first = $this->getJson('/api/education')->assertOk();

        $this->assertStringContainsString('s-maxage=600', $first->headers->get('Cache-Control'));
        $this->getJson('/api/education', ['If-None-Match' => $first->headers->get('ETag')])->assertStatus(304);
        $this->assertCount(0, $first->headers->getCookies());
    }

    public function test_a_cold_request_uses_two_queries_regardless_of_the_number_of_courses(): void
    {
        Course::factory()->count(8)->create()->each(fn (Course $course) => Project::factory()->create(['course_id' => $course->id]));
        Cache::forget(PublicCourses::CACHE_KEY);

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson('/api/education')->assertOk();

        $this->assertCount(2, DB::getQueryLog());
    }

    /**
     * Il libro legge questi campi (stessa forma di educationData.js, che fa anche da fallback).
     */
    public function test_the_fields_match_the_static_education_data(): void
    {
        $js = file_get_contents(base_path('resources/js/src/features/modals/library/educationData.js'));
        preg_match('/const educationData = \[\s*\{(.*?)\n    \},/s', $js, $block);
        preg_match_all('/^\s{8}([a-zA-Z]+):/m', $block[1] ?? '', $keys);

        Course::factory()->create();

        $this->assertNotEmpty($keys[1], 'Non riesco a leggere i campi di educationData.js');
        $this->assertSame([], array_values(array_diff($keys[1], array_keys($this->courses()[0]))));
    }

    // ---------- progetti e corsi ----------

    public function test_the_projects_api_shows_the_course_name_or_null(): void
    {
        $course = Course::factory()->create(['course' => 'Master Laravel']);
        Project::factory()->create(['github_repo' => 'con-corso', 'course_id' => $course->id]);
        Project::factory()->create(['github_repo' => 'senza-corso', 'course_id' => null]);

        $projects = collect($this->getJson('/api/projects')->json('data'))->keyBy('id');

        $this->assertSame('Master Laravel', $projects['con-corso']['course']);
        $this->assertNull($projects['senza-corso']['course']);
    }

    public function test_deleting_a_course_keeps_its_projects_without_a_course(): void
    {
        $course = Course::factory()->create();
        $project = Project::factory()->create(['course_id' => $course->id]);

        $course->delete();

        $this->assertNotNull($project->fresh());
        $this->assertNull($project->fresh()->course_id);
    }

    // ---------- cache ----------

    public function test_every_change_refreshes_the_public_api(): void
    {
        $course = Course::factory()->create(['course' => 'Prima']);
        $this->assertSame('Prima', $this->courses()[0]['course']);

        $course->update(['course' => 'Dopo']);
        $this->assertSame('Dopo', $this->courses()[0]['course']);

        $project = Project::factory()->create(['title' => 'Vecchio', 'course_id' => $course->id]);
        $this->assertSame(['Vecchio'], $this->courses()[0]['projects']);

        $project->update(['title' => 'Nuovo']);
        $this->assertSame(['Nuovo'], $this->courses()[0]['projects']);

        $course->update(['course' => 'Rinominato']);
        $this->assertSame('Rinominato', $this->getJson('/api/projects')->json('data.0.course'));

        $course->update(['hidden' => true]);
        $this->assertSame([], $this->courses());
    }

    // ---------- coerenza con le skill ----------

    public function test_renaming_a_skill_renames_it_in_courses_and_modules(): void
    {
        $skill = Skill::factory()->create(['name' => 'Node.js']);
        $course = Course::factory()->create([
            'skills' => ['HTML', 'Node.js'],
            'modules' => [
                ['title' => 'Backend', 'description' => '', 'skills' => ['Node.js', 'Express']],
                ['title' => 'Altro', 'description' => '', 'skills' => ['HTML']],
            ],
        ]);

        $skill->update(['name' => 'NodeJS']);

        $course->refresh();
        $this->assertSame(['HTML', 'NodeJS'], $course->skills);
        $this->assertSame(['NodeJS', 'Express'], $course->modules[0]['skills']);
        $this->assertSame(['HTML'], $course->modules[1]['skills']);
        $this->assertSame(['HTML', 'NodeJS'], $this->courses()[0]['skills']);
    }

    public function test_changing_other_skill_fields_leaves_courses_alone(): void
    {
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $course = Course::factory()->create(['skills' => ['PHP']]);
        $before = $course->fresh()->updated_at;

        $skill->update(['category' => 'Backend']);

        $this->assertSame(['PHP'], $course->fresh()->skills);
        $this->assertEquals($before, $course->fresh()->updated_at);
    }

    public function test_renaming_a_skill_to_a_name_already_in_the_course_does_not_duplicate_it(): void
    {
        $skill = Skill::factory()->create(['name' => 'JS']);
        $course = Course::factory()->create(['skills' => ['JavaScript', 'JS']]);

        $skill->update(['name' => 'JavaScript']);

        $this->assertSame(['JavaScript'], $course->fresh()->skills);
    }

    public function test_deleting_a_skill_removes_it_from_courses_and_modules(): void
    {
        $skill = Skill::factory()->create(['name' => 'Vecchia']);
        $course = Course::factory()->create([
            'skills' => ['Vecchia', 'Resta'],
            'modules' => [['title' => 'M', 'description' => '', 'skills' => ['Vecchia']]],
        ]);

        $skill->delete();

        $course->refresh();
        $this->assertSame(['Resta'], $course->skills);
        $this->assertSame([], $course->modules[0]['skills']);
    }

    // ---------- seeder ----------

    public function test_the_seeder_imports_the_courses_and_is_repeatable(): void
    {
        $this->seed(CourseSeeder::class);
        Course::where('course', 'LEARN REACT')->update(['period' => 'Modificato']);
        $this->seed(CourseSeeder::class);

        $this->assertSame(5, Course::count());
        $this->assertSame('Modificato', Course::where('course', 'LEARN REACT')->value('period'));
        $modules = Course::where('course', 'LEARN REACT')->firstOrFail()->modules;
        $this->assertSame('React Basics', $modules[0]['title']);
        $this->assertSame(['done', 'done', 'onHold', 'inProgress', 'inProgress'], Course::orderBy('id')->get()->map(fn (Course $c) => $c->status->value)->all());
        $this->assertSame(['React'], $modules[0]['skills']);
    }

    // ---------- pannello ----------

    public function test_the_admin_can_list_create_and_edit_courses_with_modules(): void
    {
        $this->actAsAdmin();
        Skill::factory()->create(['name' => 'PHP']);
        $existing = Course::factory()->create();

        Livewire::test(ListCourses::class)->assertCanSeeTableRecords([$existing]);

        Livewire::test(CreateCourse::class)
            ->fillForm([
                'course' => 'Nuovo corso',
                'organization' => 'Ente',
                'period' => '01/2026 - current',
                'description' => 'Descrizione',
                'skills' => ['PHP'],
                'highlights' => [['value' => 'Punto']],
                'modules' => [['title' => 'Modulo 1', 'description' => 'Testo', 'skills' => ['PHP']]],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $created = Course::where('course', 'Nuovo corso')->firstOrFail();
        $this->assertSame(['PHP'], $created->skills);
        $this->assertSame(['Punto'], $created->highlights);
        $this->assertSame('Modulo 1', $created->modules[0]['title']);
    }

    public function test_required_fields_and_url_are_validated(): void
    {
        $this->actAsAdmin();

        Livewire::test(CreateCourse::class)
            ->fillForm(['course' => '', 'organization' => '', 'period' => '', 'description' => ''])
            ->call('create')
            ->assertHasFormErrors(['course' => 'required', 'organization' => 'required', 'period' => 'required', 'description' => 'required']);

        Livewire::test(CreateCourse::class)
            ->fillForm(['course' => 'C', 'organization' => 'E', 'period' => 'P', 'description' => 'D', 'organization_url' => 'non-un-url'])
            ->call('create')
            ->assertHasFormErrors(['organization_url']);
    }

    public function test_editing_from_the_panel_refreshes_the_api(): void
    {
        $this->actAsAdmin();
        $course = Course::factory()->create(['course' => 'Prima']);
        $this->assertSame('Prima', $this->courses()[0]['course']);

        Livewire::test(EditCourse::class, ['record' => $course->getKey()])
            ->fillForm(['course' => 'Dopo'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Dopo', $this->courses()[0]['course']);
    }

    public function test_the_courses_page_requires_an_admin(): void
    {
        $this->get('/admin/courses')->assertRedirect();
    }
}
