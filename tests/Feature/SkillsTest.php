<?php

namespace Tests\Feature;

use App\Filament\Resources\Skills\Pages\CreateSkill;
use App\Filament\Resources\Skills\Pages\EditSkill;
use App\Filament\Resources\Skills\Pages\ListSkills;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use App\Support\PublicSkills;
use Database\Seeders\ProjectSeeder;
use Database\Seeders\SkillSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use Tests\TestCase;

class SkillsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<array<string, mixed>>
     */
    private function skills(): array
    {
        return $this->getJson('/api/skills')->assertOk()->json('data');
    }

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- API ----------

    public function test_the_api_returns_the_shape_the_library_uses(): void
    {
        $project = Project::factory()->create(['title' => 'Gods Guest Site']);
        $skill = Skill::factory()->create([
            'name' => 'HTML',
            'icon' => '/modals/skills/icons/html.webp',
            'category' => 'Mark-up',
            'color' => '#E34F26',
            'functions' => ['Pagine semantiche'],
            'extra_projects' => ['Tutti i progetti'],
        ]);
        $skill->projects()->attach($project);

        $this->assertSame([[
            'id' => $skill->id,
            'skill' => 'HTML',
            'icon' => '/modals/skills/icons/html.webp',
            'category' => 'Mark-up',
            'color' => '#E34F26',
            'functions' => ['Pagine semantiche'],
            'relatedProjects' => ['Gods Guest Site', 'Tutti i progetti'],
        ]], $this->skills());
    }

    public function test_hidden_skills_and_hidden_projects_are_not_exposed(): void
    {
        $visible = Project::factory()->create(['title' => 'Visibile']);
        $hidden = Project::factory()->create(['title' => 'Segreto', 'hidden' => true]);
        $skill = Skill::factory()->create(['name' => 'PHP', 'extra_projects' => []]);
        $skill->projects()->attach([$visible->id, $hidden->id]);
        Skill::factory()->create(['name' => 'Nascosta', 'hidden' => true]);

        $skills = $this->skills();

        $this->assertSame(['PHP'], array_column($skills, 'skill'));
        $this->assertSame(['Visibile'], $skills[0]['relatedProjects']);
    }

    public function test_skills_follow_the_position_then_the_name(): void
    {
        Skill::factory()->create(['name' => 'Zeta', 'position' => 1]);
        Skill::factory()->create(['name' => 'Beta', 'position' => 2]);
        Skill::factory()->create(['name' => 'Alfa', 'position' => 2]);

        $this->assertSame(['Zeta', 'Alfa', 'Beta'], array_column($this->skills(), 'skill'));
    }

    public function test_related_projects_have_no_duplicates(): void
    {
        $project = Project::factory()->create(['title' => 'Portfolio']);
        $skill = Skill::factory()->create(['extra_projects' => ['portfolio', 'Altro']]);
        $skill->projects()->attach($project);

        $this->assertSame(['Portfolio', 'Altro'], $this->skills()[0]['relatedProjects']);
    }

    public function test_the_response_is_cacheable_and_supports_304(): void
    {
        Skill::factory()->create();
        $first = $this->getJson('/api/skills')->assertOk();

        $this->assertStringContainsString('s-maxage=600', $first->headers->get('Cache-Control'));
        $this->getJson('/api/skills', ['If-None-Match' => $first->headers->get('ETag')])->assertStatus(304);
        $this->assertCount(0, $first->headers->getCookies());
    }

    public function test_a_cold_request_uses_two_queries_regardless_of_the_number_of_skills(): void
    {
        $project = Project::factory()->create();
        Skill::factory()->count(10)->create()->each(fn (Skill $skill) => $skill->projects()->attach($project));
        Cache::forget(PublicSkills::CACHE_KEY);

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson('/api/skills')->assertOk();

        $this->assertCount(2, DB::getQueryLog()); // skills + progetti collegati (con la tabella ponte), niente N+1
    }

    /**
     * La libreria legge questi campi (stessa forma di skillsData.js, che fa anche da fallback).
     */
    public function test_the_fields_match_the_static_skills_data(): void
    {
        $js = file_get_contents(base_path('resources/js/src/features/modals/library/skillsData.js'));
        preg_match('/const skillsData = \[\s*\{(.*?)
    \},/s', $js, $block);
        preg_match_all('/^\s{8}([a-zA-Z]+):/m', $block[1] ?? '', $keys);

        Skill::factory()->create();

        $this->assertNotEmpty($keys[1], 'Non riesco a leggere i campi di skillsData.js');
        $this->assertEqualsCanonicalizing($keys[1], array_keys($this->skills()[0]));
    }

    // ---------- cache ----------

    public function test_editing_a_skill_refreshes_the_api(): void
    {
        $skill = Skill::factory()->create(['name' => 'Prima']);
        $this->assertSame('Prima', $this->skills()[0]['skill']);

        $skill->update(['name' => 'Dopo']);
        $this->assertSame('Dopo', $this->skills()[0]['skill']);

        $skill->update(['hidden' => true]);
        $this->assertSame([], $this->skills());

        $skill->delete();
        $this->assertSame([], $this->skills());
    }

    public function test_renaming_or_hiding_a_project_refreshes_the_linked_skills(): void
    {
        $project = Project::factory()->create(['title' => 'Vecchio']);
        $skill = Skill::factory()->create(['extra_projects' => []]);
        $skill->projects()->attach($project);
        $this->assertSame(['Vecchio'], $this->skills()[0]['relatedProjects']);

        $project->update(['title' => 'Nuovo']);
        $this->assertSame(['Nuovo'], $this->skills()[0]['relatedProjects']);

        $project->update(['hidden' => true]);
        $this->assertSame([], $this->skills()[0]['relatedProjects']);
    }

    public function test_deleting_a_project_or_a_skill_removes_the_link_not_the_other_side(): void
    {
        $project = Project::factory()->create();
        $skill = Skill::factory()->create();
        $skill->projects()->attach($project);

        $project->delete();
        $this->assertNotNull($skill->fresh());
        $this->assertSame(0, $skill->projects()->count());
    }

    // ---------- seeder ----------

    public function test_the_seeder_links_known_projects_and_keeps_the_rest_as_free_text(): void
    {
        $this->seed(ProjectSeeder::class);
        $this->seed(SkillSeeder::class);

        $html = Skill::where('name', 'HTML')->firstOrFail();

        $this->assertSame(20, Skill::count());
        $this->assertContains('Gods Guest Site', $html->projects->pluck('title')->all());
        $this->assertSame([], $html->extra_projects);
        $this->assertSame(['Tutti i progetti'], Skill::where('name', 'Notion')->firstOrFail()->extra_projects);
    }

    public function test_running_the_seeder_again_keeps_the_panel_edits(): void
    {
        $this->seed(ProjectSeeder::class);
        $this->seed(SkillSeeder::class);
        Skill::where('name', 'HTML')->update(['category' => 'Modificata']);

        $this->seed(SkillSeeder::class);

        $this->assertSame(20, Skill::count());
        $this->assertSame('Modificata', Skill::where('name', 'HTML')->value('category'));
    }

    // ---------- pannello ----------

    public function test_the_admin_can_list_create_and_edit_skills(): void
    {
        $this->actAsAdmin();
        $project = Project::factory()->create();
        $existing = Skill::factory()->create(['name' => 'Esistente']);

        Livewire::test(ListSkills::class)->assertCanSeeTableRecords([$existing]);

        Livewire::test(CreateSkill::class)
            ->fillForm([
                'name' => 'Laravel',
                'category' => 'Framework',
                'color' => '#ff2d20',
                'functions' => [['value' => 'Costruire API']],
                'projects' => [$project->id],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $created = Skill::where('name', 'Laravel')->firstOrFail();
        $this->assertSame(['Costruire API'], $created->functions);
        $this->assertTrue($created->projects->contains($project));
    }

    public function test_saving_from_the_panel_refreshes_the_api_including_linked_projects(): void
    {
        $this->actAsAdmin();
        $project = Project::factory()->create(['title' => 'Collegato']);
        $skill = Skill::factory()->create(['extra_projects' => []]);
        $this->assertSame([], $this->skills()[0]['relatedProjects']);

        Livewire::test(EditSkill::class, ['record' => $skill->getKey()])
            ->fillForm(['projects' => [$project->id]])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame(['Collegato'], $this->skills()[0]['relatedProjects']);
    }

    public function test_name_and_category_are_required_and_name_is_unique(): void
    {
        $this->actAsAdmin();
        Skill::factory()->create(['name' => 'PHP']);

        Livewire::test(CreateSkill::class)
            ->fillForm(['name' => '', 'category' => '', 'color' => '#000000'])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required', 'category' => 'required']);

        Livewire::test(CreateSkill::class)
            ->fillForm(['name' => 'PHP', 'category' => 'Backend', 'color' => '#000000'])
            ->call('create')
            ->assertHasFormErrors(['name' => 'unique']);
    }

    public function test_the_skills_page_requires_an_admin(): void
    {
        $this->get('/admin/skills')->assertRedirect();
    }
}
