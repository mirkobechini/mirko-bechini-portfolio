<?php

namespace Tests\Feature;

use App\Filament\Resources\Courses\Pages\CreateCourse;
use App\Filament\Resources\Courses\Pages\ListCourses;
use App\Models\Certification;
use App\Models\Course;
use App\Models\User;
use Database\Seeders\CertificationSeeder;
use Database\Seeders\CourseSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * L'attestato caricato per un corso compare anche nella galleria Certificazioni, senza rifarlo a mano.
 */
class CourseCertificatesInGalleryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function gallery(): array
    {
        return $this->getJson('/api/certifications')->assertOk()->json('data');
    }

    private function png(int $width, int $height): string
    {
        $image = imagecreatetruecolor($width, $height);
        ob_start();
        imagepng($image);

        return (string) ob_get_clean();
    }

    private function courseWithUploadedCertificate(array $attributes = []): Course
    {
        Storage::disk('public')->put('courses/certificates/attestato.png', $this->png(640, 480));

        return Course::factory()->create($attributes + ['certificate_upload' => 'courses/certificates/attestato.png']);
    }

    // ---------- cosa compare ----------

    public function test_a_course_with_an_uploaded_certificate_appears_in_the_gallery(): void
    {
        $course = $this->courseWithUploadedCertificate([
            'course' => 'Master Laravel',
            'organization' => 'Boolean',
            'organization_url' => 'https://boolean.careers',
            'skills' => ['PHP', 'Laravel'],
        ]);

        $item = $this->gallery()[0];

        $this->assertSame('course-'.$course->id, $item['id']);
        $this->assertSame('Attestato del corso Master Laravel', $item['title']);
        $this->assertStringEndsWith('courses/certificates/attestato.png', $item['preview']);
        $this->assertSame(640, $item['previewWidth']);
        $this->assertSame(480, $item['previewHeight']);
        $this->assertNull($item['link']);
        $this->assertSame('Boolean', $item['organization']);
        $this->assertSame('https://boolean.careers', $item['organizationUrl']);
        $this->assertSame(['PHP', 'Laravel'], $item['skills']);
        $this->assertSame($course->id, $item['courseId']); // cliccandolo si apre il corso
    }

    public function test_a_course_with_a_hand_written_certificate_address_appears_too(): void
    {
        Course::factory()->create(['certificate' => 'https://cdn.example.com/attestato.png', 'certificate_upload' => null]);

        $item = $this->gallery()[0];

        $this->assertSame('https://cdn.example.com/attestato.png', $item['preview']);
        $this->assertNull($item['previewWidth']); // non si conoscono: il sito usa quelle predefinite
    }

    public function test_courses_without_a_certificate_do_not_appear(): void
    {
        Course::factory()->create(['certificate' => null, 'certificate_upload' => null]);
        Course::factory()->create(['certificate' => '', 'certificate_upload' => null]);

        $this->assertSame([], $this->gallery());
    }

    public function test_only_completed_courses_appear_because_an_unfinished_course_has_no_certificate(): void
    {
        foreach (['inProgress', 'onHold'] as $status) {
            Course::factory()->create(['status' => $status, 'certificate' => 'https://x.test/'.$status.'.png']);
        }

        $this->assertSame([], $this->gallery());

        Course::first()->update(['status' => 'done']);
        $this->assertCount(1, $this->gallery());

        Course::first()->update(['status' => 'onHold']); // riaperto: l'attestato esce dalla galleria
        $this->assertSame([], $this->gallery());
    }

    public function test_hidden_courses_do_not_appear(): void
    {
        $this->courseWithUploadedCertificate(['hidden' => true]);

        $this->assertSame([], $this->gallery());
    }

    public function test_the_items_have_the_same_fields_as_a_normal_certification(): void
    {
        $this->courseWithUploadedCertificate();
        Certification::factory()->create();

        $items = $this->gallery();

        $this->assertCount(2, $items);
        $this->assertEqualsCanonicalizing(array_keys($items[0]), array_keys($items[1]));
    }

    // ---------- niente doppioni ----------

    public function test_a_course_already_covered_by_a_certification_is_not_repeated(): void
    {
        $course = $this->courseWithUploadedCertificate();
        Certification::factory()->create(['title' => 'Quella fatta a mano', 'course_id' => $course->id]);

        $items = $this->gallery();

        $this->assertSame(['Quella fatta a mano'], array_column($items, 'title'));
    }

    public function test_a_hidden_certification_linked_to_a_course_also_hides_the_course_item(): void
    {
        $course = $this->courseWithUploadedCertificate();
        Certification::factory()->create(['course_id' => $course->id, 'hidden' => true]);

        $this->assertSame([], $this->gallery());
    }

    public function test_certifications_linked_to_other_courses_do_not_hide_this_one(): void
    {
        $other = Course::factory()->create();
        $course = $this->courseWithUploadedCertificate(['course' => 'Questo']);
        Certification::factory()->create(['title' => 'Di un altro corso', 'course_id' => $other->id]);

        $this->assertSame(['Di un altro corso', 'Attestato del corso Questo'], array_column($this->gallery(), 'title'));
        $this->assertSame($course->id, $this->gallery()[1]['courseId']);
    }

    public function test_the_current_data_is_not_duplicated_after_seeding(): void
    {
        // Dei corsi di partenza solo due sono completati e le due certificazioni sono collegate proprio a loro;
        // gli altri hanno un'immagine ma non sono finiti (TypeScript, CS50: una è un segnaposto, l'altra non esiste)
        $this->seed(CourseSeeder::class);
        $this->seed(CertificationSeeder::class);

        $titles = array_column($this->gallery(), 'title');

        $this->assertCount(2, $titles);
        $this->assertCount(2, array_filter($titles, fn (string $title): bool => ! str_starts_with($title, 'Attestato del corso')));
    }

    // ---------- ordine ----------

    public function test_manual_certifications_come_first_then_the_courses_from_the_most_recent(): void
    {
        Course::factory()->create(['course' => 'Vecchio', 'period' => '01/2024 - 02/2024', 'certificate' => 'https://x.test/vecchio.png']);
        Course::factory()->create(['course' => 'Recente', 'period' => '01/2026 - 02/2026', 'certificate' => 'https://x.test/recente.png']);
        Certification::factory()->create(['title' => 'Seconda', 'position' => 2]);
        Certification::factory()->create(['title' => 'Prima', 'position' => 1]);

        $this->assertSame(
            ['Prima', 'Seconda', 'Attestato del corso Recente', 'Attestato del corso Vecchio'],
            array_column($this->gallery(), 'title')
        );
    }

    // ---------- aggiornamento ----------

    public function test_adding_changing_and_removing_the_certificate_updates_the_gallery(): void
    {
        $course = Course::factory()->create(['certificate' => null, 'certificate_upload' => null]);
        $this->assertSame([], $this->gallery());

        $course->update(['certificate' => 'https://x.test/uno.png']);
        $this->assertSame('https://x.test/uno.png', $this->gallery()[0]['preview']);

        $course->update(['certificate' => 'https://x.test/due.png']);
        $this->assertSame('https://x.test/due.png', $this->gallery()[0]['preview']);

        $course->update(['hidden' => true]);
        $this->assertSame([], $this->gallery());

        $course->update(['hidden' => false, 'certificate' => null]);
        $this->assertSame([], $this->gallery());
    }

    public function test_creating_a_certification_for_the_course_replaces_the_derived_item(): void
    {
        $course = $this->courseWithUploadedCertificate(['course' => 'Corso']);
        $this->assertSame(['Attestato del corso Corso'], array_column($this->gallery(), 'title'));

        Certification::factory()->create(['title' => 'Ora a mano', 'course_id' => $course->id]);

        $this->assertSame(['Ora a mano'], array_column($this->gallery(), 'title'));
    }

    // ---------- dimensioni dell'immagine ----------

    public function test_the_size_is_read_from_the_file_when_it_changes_and_cleared_when_it_is_removed(): void
    {
        $course = $this->courseWithUploadedCertificate();
        $this->assertSame([640, 480], [$course->certificate_width, $course->certificate_height]);

        Storage::disk('public')->put('courses/certificates/altro.png', $this->png(1000, 1400));
        $course->update(['certificate_upload' => 'courses/certificates/altro.png']);
        $this->assertSame([1000, 1400], [$course->fresh()->certificate_width, $course->fresh()->certificate_height]);

        $course->update(['certificate_upload' => null]);
        $this->assertSame([null, null], [$course->fresh()->certificate_width, $course->fresh()->certificate_height]);
    }

    public function test_changing_other_fields_does_not_touch_the_size(): void
    {
        $course = $this->courseWithUploadedCertificate();

        $course->update(['description' => 'Altra descrizione']);

        $this->assertSame([640, 480], [$course->fresh()->certificate_width, $course->fresh()->certificate_height]);
    }

    public function test_an_unreadable_file_leaves_the_size_empty(): void
    {
        Storage::disk('public')->put('courses/certificates/rotto.png', 'non è un\'immagine');
        $course = Course::factory()->create(['certificate_upload' => 'courses/certificates/rotto.png']);

        $this->assertSame([null, null], [$course->certificate_width, $course->certificate_height]);
    }

    // ---------- dal pannello ----------

    public function test_a_certificate_uploaded_from_the_course_form_shows_up_once_the_course_is_completed(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);

        // Un corso nuovo parte "In corso": l'attestato c'è ma in galleria non compare ancora
        Livewire::test(CreateCourse::class)
            ->fillForm([
                'course' => 'Corso dal pannello',
                'organization' => 'Ente',
                'period' => '03/2026 - 04/2026',
                'description' => 'Descrizione',
                'certificate_upload' => UploadedFile::fake()->image('attestato.png', 800, 600),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertSame([], $this->gallery());

        // Segnato "Completato" (dal menu nella lista dei corsi) compare da solo
        Livewire::test(ListCourses::class)
            ->call('updateTableColumnState', 'status', Course::firstOrFail()->getKey(), 'done');

        $item = $this->gallery()[0];

        $this->assertSame('Attestato del corso Corso dal pannello', $item['title']);
        $this->assertSame([800, 600], [$item['previewWidth'], $item['previewHeight']]);
    }
}
