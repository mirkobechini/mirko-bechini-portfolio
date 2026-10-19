<?php

namespace Tests\Feature;

use App\Filament\Resources\Certifications\Pages\EditCertification;
use App\Filament\Resources\Certifications\Pages\ListCertifications;
use App\Filament\Resources\Courses\Pages\ListCourses;
use App\Models\Certification;
use App\Models\Course;
use App\Models\User;
use App\Support\CourseCertificateSync;
use Database\Seeders\CertificationSeeder;
use Database\Seeders\CourseSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * Un corso completato con un attestato ha la sua voce vera in /admin/certifications (e quindi nella galleria
 * del sito): la crea e la tiene aggiornata CourseCertificateSync.
 */
class CourseCertificateSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    // ---------- strumenti ----------

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

    private function completedCourse(array $attributes = []): Course
    {
        Storage::disk('public')->put('courses/certificates/attestato.png', $this->png(640, 480));

        return Course::factory()->create($attributes + [
            'status' => 'done',
            'certificate_upload' => 'courses/certificates/attestato.png',
        ]);
    }

    private function automatic(Course $course): ?Certification
    {
        return Certification::where('course_id', $course->id)->where('from_course', true)->first();
    }

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- la voce nasce ----------

    public function test_completing_a_course_with_a_certificate_creates_a_real_certification(): void
    {
        $course = $this->completedCourse([
            'course' => 'Master Laravel',
            'organization' => 'Boolean',
            'organization_url' => 'https://boolean.careers',
            'skills' => ['PHP', 'Laravel'],
        ]);

        $row = $this->automatic($course);

        $this->assertNotNull($row);
        $this->assertTrue($row->from_course);
        $this->assertFalse($row->hidden);
        $this->assertSame('Attestato del corso Master Laravel', $row->title);
        $this->assertSame('Boolean', $row->organization);
        $this->assertSame('https://boolean.careers', $row->organization_url);
        $this->assertSame(['PHP', 'Laravel'], $row->skills);
        $this->assertSame([640, 480], [$row->preview_width, $row->preview_height]);
        $this->assertStringEndsWith('courses/certificates/attestato.png', $row->preview);
        $this->assertNull($row->preview_upload); // il file è del corso: nessuno dei due può cancellarlo all'altro
    }

    public function test_the_new_row_is_in_the_admin_list_and_in_the_site_gallery(): void
    {
        $this->actAsAdmin();
        $course = $this->completedCourse(['course' => 'Multistack']);
        $row = $this->automatic($course);

        Livewire::test(ListCertifications::class)->assertCanSeeTableRecords([$row]);

        $item = $this->gallery()[0];
        $this->assertSame($row->id, $item['id']);
        $this->assertSame('Attestato del corso Multistack', $item['title']);
        $this->assertSame($course->id, $item['courseId']); // cliccandolo si apre il corso
        $this->assertSame([640, 480], [$item['previewWidth'], $item['previewHeight']]);
    }

    public function test_a_hand_written_certificate_address_works_too(): void
    {
        $course = Course::factory()->create(['status' => 'done', 'certificate' => 'https://cdn.example.com/attestato.png', 'certificate_upload' => null]);

        $this->assertSame('https://cdn.example.com/attestato.png', $this->automatic($course)->preview);
    }

    public function test_the_row_goes_to_the_end_of_the_list(): void
    {
        Certification::factory()->create(['position' => 7]);
        $first = $this->completedCourse(['course' => 'Primo']);
        $second = Course::factory()->create(['status' => 'done', 'certificate' => 'https://x.test/due.png']);

        $this->assertSame(8, $this->automatic($first)->position);
        $this->assertSame(9, $this->automatic($second)->position);
    }

    public function test_the_size_of_a_certificate_uploaded_before_is_read_at_the_next_save(): void
    {
        Storage::disk('public')->put('courses/certificates/vecchio.png', $this->png(300, 400));
        $course = Course::withoutEvents(fn () => Course::factory()->create(['certificate_upload' => 'courses/certificates/vecchio.png', 'status' => 'done']));
        $this->assertNull($course->certificate_width);

        $course->update(['description' => 'Salvato di nuovo']);

        $this->assertSame([300, 400], [$course->fresh()->certificate_width, $course->fresh()->certificate_height]);
        $this->assertSame([300, 400], [$this->automatic($course)->preview_width, $this->automatic($course)->preview_height]);
    }

    // ---------- quando non esiste ----------

    public function test_unfinished_courses_hidden_courses_and_courses_without_a_certificate_have_no_row(): void
    {
        Course::factory()->create(['status' => 'inProgress', 'certificate' => 'https://x.test/a.png']);
        Course::factory()->create(['status' => 'onHold', 'certificate' => 'https://x.test/b.png']);
        Course::factory()->create(['status' => 'done', 'certificate' => 'https://x.test/c.png', 'hidden' => true]);
        Course::factory()->create(['status' => 'done', 'certificate' => null, 'certificate_upload' => null]);
        Course::factory()->create(['status' => 'done', 'certificate' => '', 'certificate_upload' => null]);

        $this->assertSame(0, Certification::count());
    }

    public function test_the_row_follows_the_course_status_the_certificate_and_the_visibility(): void
    {
        $course = Course::factory()->create(['status' => 'inProgress', 'certificate' => 'https://x.test/a.png']);
        $this->assertNull($this->automatic($course));

        $course->update(['status' => 'done']);
        $this->assertNotNull($this->automatic($course));

        $course->update(['status' => 'onHold']); // riaperto
        $this->assertNull($this->automatic($course));

        $course->update(['status' => 'done']);
        $course->update(['certificate' => null]); // attestato tolto
        $this->assertNull($this->automatic($course));

        $course->update(['certificate' => 'https://x.test/a.png']);
        $course->update(['hidden' => true]);
        $this->assertNull($this->automatic($course));

        $course->update(['hidden' => false]);
        $this->assertNotNull($this->automatic($course));
        $this->assertCount(1, Certification::all());
    }

    public function test_marking_the_course_completed_from_the_list_creates_the_row(): void
    {
        $this->actAsAdmin();
        $course = Course::factory()->create(['status' => 'inProgress', 'certificate' => 'https://x.test/a.png']);

        Livewire::test(ListCourses::class)->call('updateTableColumnState', 'status', $course->getKey(), 'done');

        $this->assertNotNull($this->automatic($course));
        $this->assertCount(1, $this->gallery());
    }

    public function test_deleting_the_course_deletes_its_automatic_row_but_not_the_manual_ones(): void
    {
        $withRow = $this->completedCourse();
        $other = Course::factory()->create();
        $manual = Certification::factory()->create(['title' => 'A mano', 'course_id' => $other->id]);

        $withRow->delete();
        $other->delete();

        $this->assertSame(['A mano'], Certification::pluck('title')->all());
        $this->assertNull($manual->fresh()->course_id); // resta, senza corso
    }

    // ---------- la voce segue il corso, ma non le tue scelte ----------

    public function test_saving_the_course_refreshes_image_organization_and_skills_but_keeps_title_position_and_visibility(): void
    {
        $course = $this->completedCourse(['course' => 'Corso', 'organization' => 'Ente uno', 'skills' => ['PHP']]);
        $row = $this->automatic($course);
        $row->update(['title' => 'Il mio titolo', 'hidden' => true, 'position' => 40]);

        Storage::disk('public')->put('courses/certificates/nuovo.png', $this->png(900, 1200));
        $course->update(['organization' => 'Ente due', 'skills' => ['PHP', 'React'], 'certificate_upload' => 'courses/certificates/nuovo.png']);

        $row->refresh();
        $this->assertSame('Ente due', $row->organization);
        $this->assertSame(['PHP', 'React'], $row->skills);
        $this->assertSame([900, 1200], [$row->preview_width, $row->preview_height]);
        $this->assertStringEndsWith('courses/certificates/nuovo.png', $row->preview);
        $this->assertSame('Il mio titolo', $row->title);
        $this->assertTrue($row->hidden);
        $this->assertSame(40, $row->position);
        $this->assertCount(1, Certification::all()); // non ne nascono altre
    }

    // ---------- una certificazione scritta a mano vale di più ----------

    public function test_a_certification_written_by_hand_for_the_course_means_no_automatic_row(): void
    {
        $manual = Certification::factory()->create(['title' => 'A mano']);
        $course = $this->completedCourse(['course' => 'Corso']);
        $this->assertNotNull($this->automatic($course)); // per ora la voce c'è

        $manual->update(['course_id' => $course->id]);

        $this->assertNull($this->automatic($course));
        $this->assertSame(['A mano'], Certification::pluck('title')->all());
    }

    public function test_a_hidden_manual_certification_also_blocks_the_automatic_row(): void
    {
        $course = Course::factory()->create(['status' => 'done', 'certificate' => 'https://x.test/a.png']);
        $this->assertNotNull($this->automatic($course));

        Certification::factory()->create(['course_id' => $course->id, 'hidden' => true]);

        $this->assertNull($this->automatic($course));
        $this->assertSame([], $this->gallery()); // nascondere è una scelta: non si aggira
    }

    public function test_creating_a_manual_certification_for_a_course_without_a_row_does_not_create_one(): void
    {
        $course = $this->completedCourse();
        $this->automatic($course)->delete();

        Certification::factory()->create(['course_id' => $course->id]);
        $course->update(['description' => 'Salvato di nuovo']);

        $this->assertNull($this->automatic($course));
        $this->assertCount(1, Certification::all());
    }

    public function test_deleting_or_moving_the_manual_certification_brings_the_automatic_row_back(): void
    {
        $course = $this->completedCourse();
        $manual = Certification::factory()->create(['course_id' => $course->id]);
        $this->assertNull($this->automatic($course));

        $manual->delete();
        $this->assertNotNull($this->automatic($course));

        $manual2 = Certification::factory()->create(['course_id' => $course->id]);
        $this->assertNull($this->automatic($course));

        $manual2->update(['course_id' => null]);
        $this->assertNotNull($this->automatic($course));
    }

    public function test_certifications_of_other_courses_do_not_affect_this_one(): void
    {
        $other = Course::factory()->create();
        Certification::factory()->create(['course_id' => $other->id]);

        $course = $this->completedCourse();

        $this->assertNotNull($this->automatic($course));
    }

    public function test_the_current_data_is_not_duplicated_after_seeding(): void
    {
        $this->seed(CourseSeeder::class);
        $this->seed(CertificationSeeder::class);

        // Dei corsi di partenza solo due sono completati e le due certificazioni sono collegate proprio a loro
        $this->assertSame(2, Certification::count());
        $this->assertSame(0, Certification::where('from_course', true)->count());
        $this->assertCount(2, $this->gallery());
    }

    public function test_the_backfill_creates_the_rows_for_courses_that_were_completed_before(): void
    {
        $course = Course::withoutEvents(fn () => Course::factory()->create(['status' => 'done', 'certificate' => 'https://x.test/a.png']));
        $this->assertSame(0, Certification::count());

        CourseCertificateSync::syncAll();
        CourseCertificateSync::syncAll(); // ripetibile: non crea doppioni

        $this->assertSame(1, Certification::where('course_id', $course->id)->count());
    }

    // ---------- il pannello ----------

    public function test_the_list_tells_where_each_row_comes_from(): void
    {
        $this->actAsAdmin();
        $auto = $this->automatic($this->completedCourse());
        $manual = Certification::factory()->create();

        Livewire::test(ListCertifications::class)
            ->assertTableColumnFormattedStateSet('from_course', 'Dal corso', $auto)
            ->assertTableColumnFormattedStateSet('from_course', 'A mano', $manual);
    }

    public function test_an_automatic_row_cannot_be_deleted_from_the_panel_only_hidden(): void
    {
        $this->actAsAdmin();
        $auto = $this->automatic($this->completedCourse());
        $manual = Certification::factory()->create();

        Livewire::test(ListCertifications::class)
            ->assertTableActionHidden('delete', $auto)
            ->assertTableActionVisible('delete', $manual)
            ->callTableBulkAction('delete', [$auto, $manual]);

        $this->assertNotNull($auto->fresh());
        $this->assertNull($manual->fresh());
    }

    public function test_an_automatic_row_has_its_image_fields_locked_but_can_be_renamed_and_hidden(): void
    {
        $this->actAsAdmin();
        $auto = $this->automatic($this->completedCourse(['organization' => 'Ente']));

        Livewire::test(EditCertification::class, ['record' => $auto->getKey()])
            ->assertFormFieldIsDisabled('preview')
            ->assertFormFieldIsDisabled('preview_upload')
            ->assertFormFieldIsDisabled('pdf_import')
            ->assertFormFieldIsDisabled('organization')
            ->assertFormFieldIsDisabled('skills')
            ->fillForm(['title' => 'Titolo cambiato', 'hidden' => true])
            ->call('save')
            ->assertHasNoFormErrors();

        $auto->refresh();
        $this->assertSame('Titolo cambiato', $auto->title);
        $this->assertTrue($auto->hidden);
        $this->assertSame('Ente', $auto->organization);
        $this->assertStringEndsWith('courses/certificates/attestato.png', $auto->preview);
        $this->assertSame([], $this->gallery()); // nascosta: sparisce dal sito
    }

    public function test_a_manual_row_keeps_all_its_fields_editable(): void
    {
        $this->actAsAdmin();
        $manual = Certification::factory()->create();

        Livewire::test(EditCertification::class, ['record' => $manual->getKey()])
            ->assertFormFieldIsEnabled('preview')
            ->assertFormFieldIsEnabled('organization')
            ->assertFormFieldIsEnabled('pdf_import');
    }

    // ---------- galleria: solo voci con immagine (già coperto, qui sui dati nuovi) ----------

    public function test_certifications_without_an_image_are_not_sent(): void
    {
        Certification::factory()->create(['title' => 'Senza immagine', 'preview' => null, 'preview_upload' => null]);
        Certification::factory()->create(['title' => 'Immagine vuota', 'preview' => '', 'preview_upload' => null]);
        Certification::factory()->create(['title' => 'Con indirizzo', 'preview' => '/modals/certifications/x.webp', 'preview_upload' => null]);

        $this->assertSame(['Con indirizzo'], array_column($this->gallery(), 'title'));
    }

    public function test_the_typescript_course_of_the_seed_data_has_no_certificate_and_does_not_borrow_reacts(): void
    {
        $this->seed(CourseSeeder::class);

        $this->assertNull(Course::where('course', 'LEARN TYPESCRIPT')->firstOrFail()->certificate);
        $this->assertFileDoesNotExist(public_path('assets/modals/certifications/certificato-typescript-scrimba.webp'));
    }
}
