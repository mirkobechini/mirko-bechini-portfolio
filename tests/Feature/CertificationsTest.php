<?php

namespace Tests\Feature;

use App\Filament\Resources\Certifications\Pages\CreateCertification;
use App\Filament\Resources\Certifications\Pages\EditCertification;
use App\Filament\Resources\Certifications\Pages\ListCertifications;
use App\Models\Certification;
use App\Models\Course;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\CertificationSeeder;
use Database\Seeders\CourseSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CertificationsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<array<string, mixed>>
     */
    private function certifications(): array
    {
        return $this->getJson('/api/certifications')->assertOk()->json('data');
    }

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- API ----------

    public function test_the_api_returns_the_shape_the_gallery_uses_plus_the_course_id(): void
    {
        $course = Course::factory()->create();
        $certification = Certification::factory()->create([
            'title' => 'Attestato React',
            'preview' => '/modals/certifications/react.webp',
            'preview_width' => 1320,
            'preview_height' => 840,
            'link' => 'https://example.com/verifica',
            'organization' => 'Scrimba',
            'organization_url' => 'https://scrimba.com',
            'skills' => ['React'],
            'course_id' => $course->id,
        ]);

        $this->assertSame([[
            'id' => $certification->id,
            'title' => 'Attestato React',
            'preview' => '/modals/certifications/react.webp',
            'previewWidth' => 1320,
            'previewHeight' => 840,
            'link' => 'https://example.com/verifica',
            'organization' => 'Scrimba',
            'organizationUrl' => 'https://scrimba.com',
            'skills' => ['React'],
            'courseId' => $course->id,
        ]], $this->certifications());
    }

    public function test_optional_values_are_empty_or_null(): void
    {
        Certification::factory()->create(['link' => null, 'organization_url' => null, 'skills' => null, 'course_id' => null]);

        $item = $this->certifications()[0];

        $this->assertNull($item['link']);
        $this->assertNull($item['courseId']);
        $this->assertSame('', $item['organizationUrl']);
        $this->assertSame([], $item['skills']);
    }

    public function test_hidden_certifications_are_not_exposed_and_order_follows_position(): void
    {
        Certification::factory()->create(['title' => 'Secondo', 'position' => 2]);
        Certification::factory()->create(['title' => 'Primo', 'position' => 1]);
        Certification::factory()->create(['title' => 'Nascosto', 'hidden' => true]);

        $this->assertSame(['Primo', 'Secondo'], array_column($this->certifications(), 'title'));
    }

    public function test_the_response_is_cacheable_and_supports_304(): void
    {
        Certification::factory()->create();
        $first = $this->getJson('/api/certifications')->assertOk();

        $this->assertMatchesRegularExpression('/s-maxage=60(,|$)/', $first->headers->get('Cache-Control'));
        $this->getJson('/api/certifications', ['If-None-Match' => $first->headers->get('ETag')])->assertStatus(304);
    }

    /**
     * La galleria legge questi campi (stessa forma di certificationData.js, che fa anche da fallback).
     */
    public function test_the_fields_match_the_static_certification_data(): void
    {
        $js = file_get_contents(base_path('resources/js/src/features/modals/certifications/certificationData.js'));
        preg_match('/const certificationData = \[\s*\{(.*?)\n    \},/s', $js, $block);
        preg_match_all('/^\s{8}([a-zA-Z]+):/m', $block[1] ?? '', $keys);

        Certification::factory()->create();

        $this->assertNotEmpty($keys[1], 'Non riesco a leggere i campi di certificationData.js');
        $this->assertSame([], array_values(array_diff($keys[1], array_keys($this->certifications()[0]))));
    }

    // ---------- relazioni e coerenza ----------

    public function test_deleting_a_course_keeps_the_certification_without_a_course(): void
    {
        $course = Course::factory()->create();
        $certification = Certification::factory()->create(['course_id' => $course->id]);

        $course->delete();

        $this->assertNotNull($certification->fresh());
        $this->assertNull($this->certifications()[0]['courseId']);
    }

    public function test_changes_refresh_the_api(): void
    {
        $certification = Certification::factory()->create(['title' => 'Prima']);
        $this->assertSame('Prima', $this->certifications()[0]['title']);

        $certification->update(['title' => 'Dopo']);
        $this->assertSame('Dopo', $this->certifications()[0]['title']);

        $certification->update(['hidden' => true]);
        $this->assertSame([], $this->certifications());
    }

    public function test_skill_renames_and_deletions_reach_the_certifications(): void
    {
        $skill = Skill::factory()->create(['name' => 'Node.js']);
        $certification = Certification::factory()->create(['skills' => ['React', 'Node.js']]);

        $skill->update(['name' => 'NodeJS']);
        $this->assertSame(['React', 'NodeJS'], $certification->fresh()->skills);

        $skill->delete();
        $this->assertSame(['React'], $certification->fresh()->skills);
    }

    // ---------- seeder ----------

    public function test_the_seeder_links_certifications_to_the_right_course_and_is_repeatable(): void
    {
        $this->seed(CourseSeeder::class);
        $this->seed(CertificationSeeder::class);
        Certification::query()->update(['organization' => 'Modificata']);
        $this->seed(CertificationSeeder::class);

        $this->assertSame(2, Certification::count());
        $this->assertSame('Modificata', Certification::first()->organization);
        $this->assertSame(
            ['LEARN REACT'],
            Certification::where('preview', 'like', '%react-scrimba%')->get()->map(fn (Certification $c) => $c->course->course)->all()
        );
    }

    // ---------- pannello ----------

    public function test_the_admin_can_list_create_and_edit_certifications(): void
    {
        $this->actAsAdmin();
        $course = Course::factory()->create();
        $existing = Certification::factory()->create();

        Livewire::test(ListCertifications::class)->assertCanSeeTableRecords([$existing]);

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'Nuovo attestato',
                'organization' => 'Ente',
                'preview' => '/modals/certifications/x.webp',
                'course_id' => $course->id,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertSame($course->id, Certification::where('title', 'Nuovo attestato')->value('course_id'));

        Livewire::test(EditCertification::class, ['record' => $existing->getKey()])
            ->fillForm(['title' => 'Cambiato'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Cambiato', $existing->fresh()->title);
    }

    public function test_required_fields_and_urls_are_validated(): void
    {
        $this->actAsAdmin();

        Livewire::test(CreateCertification::class)
            ->fillForm(['title' => '', 'organization' => '', 'preview' => ''])
            ->call('create')
            ->assertHasFormErrors(['title' => 'required', 'organization' => 'required', 'preview' => 'required']);

        Livewire::test(CreateCertification::class)
            ->fillForm(['title' => 'T', 'organization' => 'E', 'preview' => 'p', 'link' => 'non-un-url'])
            ->call('create')
            ->assertHasFormErrors(['link']);
    }

    public function test_the_page_requires_an_admin(): void
    {
        $this->get('/admin/certifications')->assertRedirect();
    }
}
