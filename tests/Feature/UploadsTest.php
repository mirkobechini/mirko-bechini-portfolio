<?php

namespace Tests\Feature;

use App\Filament\Resources\Certifications\Pages\CreateCertification;
use App\Filament\Resources\Certifications\Pages\EditCertification;
use App\Filament\Resources\Courses\Pages\CreateCourse;
use App\Filament\Resources\Projects\Pages\EditProject;
use App\Models\Certification;
use App\Models\Course;
use App\Models\Project;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * Caricamento immagini di attestati, corsi e progetti (le icone delle skill sono in SkillsTest).
 */
class UploadsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- certificazioni ----------

    public function test_a_certification_needs_either_an_address_or_a_file(): void
    {
        Livewire::test(CreateCertification::class)
            ->fillForm(['title' => 'T', 'organization' => 'E', 'preview' => '', 'preview_upload' => null])
            ->call('create')
            ->assertHasFormErrors(['preview' => 'required']);

        Livewire::test(CreateCertification::class)
            ->fillForm(['title' => 'T', 'organization' => 'E', 'preview' => '/modals/certifications/x.webp'])
            ->call('create')
            ->assertHasNoFormErrors();
    }

    public function test_an_uploaded_certification_image_wins_and_its_size_is_read_from_the_file(): void
    {
        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'Con file',
                'organization' => 'E',
                'preview' => '',
                'preview_upload' => UploadedFile::fake()->image('att.png', 640, 480),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $certification = Certification::where('title', 'Con file')->firstOrFail();

        $this->assertSame(640, $certification->preview_width);
        $this->assertSame(480, $certification->preview_height);
        Storage::disk('public')->assertExists($certification->preview_upload);
        $this->assertStringEndsWith($certification->preview_upload, $this->getJson('/api/certifications')->json('data.0.preview'));
    }

    public function test_the_certification_keeps_its_manual_address_when_there_is_no_file(): void
    {
        Certification::factory()->create(['preview' => '/modals/certifications/x.webp', 'preview_upload' => null]);

        $this->assertSame('/modals/certifications/x.webp', $this->getJson('/api/certifications')->json('data.0.preview'));
    }

    public function test_replacing_or_deleting_a_certification_removes_the_old_file(): void
    {
        Storage::disk('public')->put('certifications/previews/a.png', 'x');
        Storage::disk('public')->put('certifications/previews/b.png', 'y');
        $certification = Certification::factory()->create(['preview_upload' => 'certifications/previews/a.png']);

        Livewire::test(EditCertification::class, ['record' => $certification->getKey()])
            ->fillForm(['title' => 'Cambiato'])
            ->call('save')
            ->assertHasNoFormErrors();
        Storage::disk('public')->assertExists('certifications/previews/a.png');

        $certification->update(['preview_upload' => 'certifications/previews/b.png']);
        Storage::disk('public')->assertMissing('certifications/previews/a.png');

        $certification->delete();
        Storage::disk('public')->assertMissing('certifications/previews/b.png');
    }

    public function test_certification_files_are_limited_to_2_mb_and_safe_types(): void
    {
        $base = ['title' => 'T', 'organization' => 'E', 'preview' => ''];

        foreach ([
            UploadedFile::fake()->create('x.svg', 5, 'image/svg+xml'),
            UploadedFile::fake()->create('x.pdf', 5, 'application/pdf'),
            UploadedFile::fake()->image('grande.png')->size(2100),
        ] as $file) {
            Livewire::test(CreateCertification::class)
                ->fillForm($base + ['preview_upload' => $file])
                ->call('create')
                ->assertHasFormErrors(['preview_upload']);
        }

        $this->assertSame(0, Certification::count());
    }

    // ---------- corsi ----------

    public function test_an_uploaded_course_certificate_wins_in_the_api(): void
    {
        Livewire::test(CreateCourse::class)
            ->fillForm([
                'course' => 'Corso',
                'organization' => 'Ente',
                'period' => 'P',
                'description' => 'D',
                'certificate' => '/modals/certifications/vecchio.webp',
                'certificate_upload' => UploadedFile::fake()->image('att.webp', 100, 100),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $course = Course::where('course', 'Corso')->firstOrFail();

        Storage::disk('public')->assertExists($course->certificate_upload);
        $this->assertStringEndsWith($course->certificate_upload, $this->getJson('/api/education')->json('data.0.certificate'));
    }

    public function test_the_course_keeps_its_manual_address_without_a_file_and_cleans_up_on_delete(): void
    {
        $manual = Course::factory()->create(['certificate' => 'https://cdn.example.com/c.png', 'certificate_upload' => null]);
        $this->assertSame('https://cdn.example.com/c.png', $this->getJson('/api/education')->json('data.0.certificate'));
        $manual->delete();

        Storage::disk('public')->put('courses/certificates/c.png', 'x');
        $course = Course::factory()->create(['certificate_upload' => 'courses/certificates/c.png']);

        $course->delete();

        Storage::disk('public')->assertMissing('courses/certificates/c.png');
    }

    // ---------- progetti ----------

    public function test_a_project_preview_can_be_uploaded_and_is_exposed(): void
    {
        $project = Project::factory()->create();
        $this->assertNull($this->getJson('/api/projects')->json('data.0.preview'));

        Livewire::test(EditProject::class, ['record' => $project->getKey()])
            ->fillForm(['preview_upload' => UploadedFile::fake()->image('anteprima.png', 800, 450)])
            ->call('save')
            ->assertHasNoFormErrors();

        $project->refresh();
        Storage::disk('public')->assertExists($project->preview_upload);
        $this->assertStringEndsWith($project->preview_upload, $this->getJson('/api/projects')->json('data.0.preview'));
    }

    public function test_the_github_sync_never_touches_the_uploaded_preview(): void
    {
        $project = Project::factory()->create(['preview_upload' => 'projects/previews/p.png']);

        $project->update(['stars' => 99, 'synced_at' => now()]);

        $this->assertSame('projects/previews/p.png', $project->fresh()->preview_upload);
    }

    public function test_replacing_or_deleting_a_project_removes_the_old_preview(): void
    {
        Storage::disk('public')->put('projects/previews/a.png', 'x');
        Storage::disk('public')->put('projects/previews/b.png', 'y');
        $project = Project::factory()->create(['preview_upload' => 'projects/previews/a.png']);

        $project->update(['preview_upload' => 'projects/previews/b.png']);
        Storage::disk('public')->assertMissing('projects/previews/a.png');

        $project->delete();
        Storage::disk('public')->assertMissing('projects/previews/b.png');
    }
}
