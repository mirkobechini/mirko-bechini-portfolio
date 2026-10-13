<?php

namespace Tests\Feature;

use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use App\Filament\Resources\FormationSteps\Pages\CreateFormationStep;
use App\Filament\Resources\FormationSteps\Pages\EditFormationStep;
use App\Filament\Resources\FormationSteps\Pages\ListFormationSteps;
use App\Models\FormationStep;
use App\Models\User;
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

        $step->update(['title' => 'Dopo', 'status' => FormationStepStatus::Done]);
        $this->assertSame('Dopo', $this->steps()[0]['title']);
        $this->assertSame('done', $this->steps()[0]['status']);

        $step->delete();
        $this->assertSame([], $this->steps());
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

    public function test_the_seeder_imports_the_five_steps_and_is_repeatable(): void
    {
        $this->seed(FormationStepSeeder::class);
        FormationStep::where('title', 'Learn Angular')->update(['status' => 'done']);
        $this->seed(FormationStepSeeder::class);

        $this->assertSame(5, FormationStep::count());
        $this->assertSame(2, FormationStep::where('kind', 'focus')->count());
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
