<?php

namespace Tests\Feature;

use App\Filament\Resources\Certifications\Pages\CreateCertification;
use App\Filament\Resources\Certifications\Pages\EditCertification;
use App\Models\Certification;
use App\Models\User;
use App\Support\PdfPreview\PdfConversionFailed;
use App\Support\PdfPreview\PdfEditorConverter;
use App\Support\PdfPreview\PdfPreviewConverter;
use App\Support\PdfPreview\PdfPreviewImage;
use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\FileUploadConfiguration;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * Caricamento di un PDF come immagine di una certificazione: il PDF si converte (prima pagina) e sul sito
 * resta solo l'immagine.
 */
class PdfPreviewTest extends TestCase
{
    use RefreshDatabase;

    private const API = 'https://pdfeditor.test';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.pdfeditor.url' => self::API]);
        Cache::flush();
        Storage::fake('public');
    }

    // ---------- strumenti dei test ----------

    private function png(int $width = 800, int $height = 1100): string
    {
        $image = imagecreatetruecolor($width, $height);
        imagefill($image, 0, 0, imagecolorallocate($image, 250, 250, 250));
        imagerectangle($image, 20, 20, $width - 20, $height - 20, imagecolorallocate($image, 30, 90, 160));

        ob_start();
        imagepng($image);

        return (string) ob_get_clean();
    }

    private function pdf(): string
    {
        return "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n";
    }

    private function jwt(int $expiresIn): string
    {
        $encode = fn (array $part): string => rtrim(strtr(base64_encode((string) json_encode($part)), '+/', '-_'), '=');

        return $encode(['alg' => 'HS256']).'.'.$encode(['sub' => 'guest', 'exp' => time() + $expiresIn]).'.firma';
    }

    /**
     * Risposte di PdfEditor che vanno tutte a buon fine.
     */
    private function fakeApi(?string $png = null, ?string $token = null): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $token ?? $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response(['id' => 'abc-123', 'page_count' => 2], 201),
            self::API.'/pdfs/abc-123/export*' => Http::response($png ?? $this->png(), 200, ['Content-Type' => 'image/png']),
            self::API.'/pdfs/abc-123' => Http::response('', 204),
        ]);
    }

    private function sentTo(string $suffix, string $method): int
    {
        return Http::recorded(fn (Request $request): bool => $request->method() === $method && str_ends_with(strtok($request->url(), '?'), $suffix))->count();
    }

    private function fakeConverter(string $png): void
    {
        $this->app->bind(PdfPreviewConverter::class, fn () => new class($png) implements PdfPreviewConverter
        {
            public int $calls = 0;

            public function __construct(private readonly string $png) {}

            public function convert(string $pdf): string
            {
                $this->calls++;

                return $this->png;
            }
        });
    }

    private function failingConverter(string $message = 'Il servizio di conversione non risponde.'): void
    {
        $this->app->bind(PdfPreviewConverter::class, fn () => new class($message) implements PdfPreviewConverter
        {
            public function __construct(private readonly string $message) {}

            public function convert(string $pdf): string
            {
                throw new PdfConversionFailed($this->message);
            }
        });
    }

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- convertitore PdfEditor ----------

    public function test_the_converter_logs_in_uploads_exports_and_deletes_in_that_order(): void
    {
        $this->fakeApi($png = $this->png());

        $result = (new PdfEditorConverter)->convert($this->pdf());

        $this->assertSame($png, $result);

        $order = Http::recorded()->map(fn (array $pair): string => $pair[0]->method().' '.parse_url($pair[0]->url(), PHP_URL_PATH))->all();
        $this->assertSame([
            'POST /auth/guest',
            'POST /pdfs/upload',
            'POST /pdfs/abc-123/export',
            'DELETE /pdfs/abc-123',
        ], $order);
    }

    public function test_requests_carry_the_user_agent_and_the_guest_token_and_the_pdf_is_sent_as_a_file(): void
    {
        $token = $this->jwt(3600);
        $this->fakeApi(null, $token);

        (new PdfEditorConverter)->convert($this->pdf());

        Http::assertSent(fn (Request $request): bool => $request->hasHeader('User-Agent', PdfEditorConverter::USER_AGENT));
        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/pdfs/upload')
            && $request->hasHeader('Authorization', 'Bearer '.$token)
            && str_contains($request->body(), '%PDF-1.4')
            && str_contains($request->body(), 'filename="attestato.pdf"'));
        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/export?fmt=png') && $request->hasHeader('Authorization', 'Bearer '.$token));
    }

    public function test_the_guest_login_is_reused_across_conversions(): void
    {
        $this->fakeApi();

        $converter = new PdfEditorConverter;
        $converter->convert($this->pdf());
        $converter->convert($this->pdf());

        $this->assertSame(1, $this->sentTo('/auth/guest', 'POST'));
        $this->assertSame(2, $this->sentTo('/pdfs/upload', 'POST'));
    }

    public function test_a_token_about_to_expire_is_not_kept(): void
    {
        $this->fakeApi(null, $this->jwt(60)); // scade tra un minuto: meno del margine

        $converter = new PdfEditorConverter;
        $converter->convert($this->pdf());
        $converter->convert($this->pdf());

        $this->assertSame(2, $this->sentTo('/auth/guest', 'POST'));
    }

    public function test_a_revoked_token_triggers_one_new_login_and_one_retry(): void
    {
        Cache::put('pdfeditor.guest-token', 'vecchio', 3600);
        Http::fake([
            self::API.'/pdfs/upload' => Http::sequence()
                ->push('', 401)
                ->push(['id' => 'abc-123'], 201),
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/abc-123/export*' => Http::response($this->png(), 200),
            self::API.'/pdfs/abc-123' => Http::response('', 204),
        ]);

        $result = (new PdfEditorConverter)->convert($this->pdf());

        $this->assertStringStartsWith("\x89PNG", $result);
        $this->assertSame(1, $this->sentTo('/auth/guest', 'POST'));
        $this->assertSame(2, $this->sentTo('/pdfs/upload', 'POST'));
    }

    public function test_it_gives_up_after_a_second_refusal(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response('', 401),
        ]);

        $this->expectException(PdfConversionFailed::class);
        $this->expectExceptionMessage('rifiutato l\'accesso');

        try {
            (new PdfEditorConverter)->convert($this->pdf());
        } finally {
            $this->assertSame(2, $this->sentTo('/pdfs/upload', 'POST')); // non insiste all'infinito
        }
    }

    public function test_the_uploaded_pdf_is_deleted_even_when_the_export_fails(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response(['id' => 'abc-123'], 201),
            self::API.'/pdfs/abc-123/export*' => Http::response('errore', 500),
            self::API.'/pdfs/abc-123' => Http::response('', 204),
        ]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertStringContainsString('non ha restituito un\'immagine', $e->getMessage());
        }

        $this->assertSame(1, $this->sentTo('/pdfs/abc-123', 'DELETE'));
    }

    public function test_a_response_that_is_not_a_png_is_refused_and_the_pdf_is_still_deleted(): void
    {
        $this->fakeApi('<html>non sono un PNG</html>');

        $this->expectException(PdfConversionFailed::class);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
        } finally {
            $this->assertSame(1, $this->sentTo('/pdfs/abc-123', 'DELETE'));
        }
    }

    public function test_a_failing_cleanup_does_not_fail_a_conversion_that_worked(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response(['id' => 'abc-123'], 201),
            self::API.'/pdfs/abc-123/export*' => Http::response($png = $this->png(), 200),
            self::API.'/pdfs/abc-123' => fn () => throw new ConnectionException('rete caduta'),
        ]);

        $this->assertSame($png, (new PdfEditorConverter)->convert($this->pdf()));
    }

    public function test_an_upload_refused_by_the_service_is_reported_without_trying_to_export(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response(['detail' => 'troppo grande'], 413),
        ]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertStringContainsString('non ha accettato il PDF', $e->getMessage());
        }

        $this->assertSame(0, $this->sentTo('/export', 'POST'));
        $this->assertSame(0, Http::recorded(fn (Request $r): bool => $r->method() === 'DELETE')->count());
    }

    public function test_an_upload_answer_without_an_id_is_refused(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response(['ok' => true], 201),
        ]);

        $this->expectException(PdfConversionFailed::class);

        (new PdfEditorConverter)->convert($this->pdf());
    }

    public function test_a_failed_guest_login_is_reported(): void
    {
        Http::fake([self::API.'/auth/guest' => Http::response('', 500)]);

        $this->expectException(PdfConversionFailed::class);
        $this->expectExceptionMessage('non ha concesso l\'accesso');

        (new PdfEditorConverter)->convert($this->pdf());
    }

    public function test_an_unreachable_service_is_reported_in_italian(): void
    {
        Http::fake(fn () => throw new ConnectionException('timeout'));

        $this->expectException(PdfConversionFailed::class);
        $this->expectExceptionMessage('Il servizio di conversione non risponde.');

        (new PdfEditorConverter)->convert($this->pdf());
    }

    public function test_the_service_address_comes_from_the_configuration(): void
    {
        config(['services.pdfeditor.url' => 'https://altro.example.com']);
        Http::fake(['altro.example.com/*' => Http::response('', 500)]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
        } catch (PdfConversionFailed) {
        }

        Http::assertSent(fn (Request $request): bool => str_starts_with($request->url(), 'https://altro.example.com/auth/guest'));
    }

    // ---------- diagnosi quando dal server la conversione non riesce ----------

    public function test_a_rate_limited_guest_login_says_so_in_plain_words(): void
    {
        Http::fake([self::API.'/auth/guest' => Http::response('Too Many Requests', 429)]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertSame("Il servizio di conversione non ha concesso l'accesso (troppe richieste, riprova tra qualche minuto).", $e->getMessage());
        }
    }

    public function test_a_blocked_request_names_the_403(): void
    {
        Http::fake([self::API.'/auth/guest' => Http::response('<html><title>Attention Required</title></html>', 403, ['cf-mitigated' => 'challenge'])]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertSame("Il servizio di conversione non ha concesso l'accesso (richiesta bloccata, codice 403).", $e->getMessage());
        }
    }

    public function test_an_upload_failure_shows_the_status_code(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response('', 503),
        ]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertSame('Il servizio di conversione non ha accettato il PDF (codice 503).', $e->getMessage());
        }
    }

    public function test_an_export_failure_shows_the_status_code(): void
    {
        Http::fake([
            self::API.'/auth/guest' => Http::response(['access_token' => $this->jwt(3600)], 201),
            self::API.'/pdfs/upload' => Http::response(['id' => 'abc-123'], 201),
            self::API.'/pdfs/abc-123/export*' => Http::response('', 500),
            self::API.'/pdfs/abc-123' => Http::response('', 204),
        ]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertSame("Il servizio di conversione non ha restituito un'immagine (codice 500).", $e->getMessage());
        }
    }

    public function test_answers_that_succeed_but_make_no_sense_say_the_answer_is_invalid(): void
    {
        Http::fake([self::API.'/auth/guest' => Http::response(['senza' => 'token'], 201)]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertSame("Il servizio di conversione non ha concesso l'accesso (risposta non valida).", $e->getMessage());
        }
    }

    public function test_the_failure_detail_goes_to_the_log_without_leaking_secrets(): void
    {
        Log::spy();
        Http::fake([self::API.'/auth/guest' => Http::response('<html>Blocked by '.str_repeat('x', 500).'</html>', 403, ['cf-mitigated' => 'challenge'])]);

        try {
            (new PdfEditorConverter)->convert($this->pdf());
        } catch (PdfConversionFailed) {
        }

        Log::shouldHaveReceived('warning')->once()->withArgs(function (string $message, array $context): bool {
            return str_contains($message, 'accesso ospite')
                && $context['status'] === 403
                && $context['cf_mitigated'] === 'challenge'
                && mb_strlen($context['body']) <= 200            // il corpo si accorcia
                && ! str_contains($context['body'], '<html>');     // e si ripulisce dai tag
        });
    }

    public function test_a_successful_conversion_writes_nothing_to_the_log(): void
    {
        Log::spy();
        $this->fakeApi();

        (new PdfEditorConverter)->convert($this->pdf());

        Log::shouldNotHaveReceived('warning');
    }

    // ---------- immagine pubblicata ----------

    public function test_the_image_is_stored_on_the_uploads_disk_and_the_pdf_is_not(): void
    {
        $this->fakeConverter($this->png(800, 1100));

        $path = app(PdfPreviewImage::class)->store($this->pdf(), 'certifications/previews');

        $this->assertStringStartsWith('certifications/previews/', $path);
        $this->assertMatchesRegularExpression('/\.(webp|png)$/', $path);
        Storage::disk('public')->assertExists($path);
        $this->assertSame([$path], Storage::disk('public')->allFiles()); // un solo file: l'immagine
        $this->assertNotFalse(getimagesizefromstring(Storage::disk('public')->get($path)));
    }

    public function test_wide_images_are_scaled_down_and_small_ones_are_not_enlarged(): void
    {
        // Larga ma bassa: la regola riguarda la larghezza, e un'immagine leggera non appesantisce la suite
        $this->fakeConverter($this->png(1700, 300));
        $big = app(PdfPreviewImage::class)->store($this->pdf(), 'x');

        $this->fakeConverter($this->png(500, 700));
        $small = app(PdfPreviewImage::class)->store($this->pdf(), 'x');

        $scaled = getimagesizefromstring(Storage::disk('public')->get($big));
        $this->assertSame(PdfPreviewImage::MAX_WIDTH, $scaled[0]);
        $this->assertSame(282, $scaled[1]); // proporzioni mantenute: 300 * 1600 / 1700
        $this->assertSame(500, getimagesizefromstring(Storage::disk('public')->get($small))[0]);
    }

    public function test_a_huge_image_is_refused_before_it_is_decoded(): void
    {
        // Un PNG con l'intestazione di 20000x20000 px: se lo si decodificasse servirebbero gigabyte
        $ihdr = pack('NNCCCCC', 20000, 20000, 8, 2, 0, 0, 0);
        $this->fakeConverter(hex2bin('89504e470d0a1a0a').pack('N', 13).'IHDR'.$ihdr.pack('N', crc32('IHDR'.$ihdr)));

        try {
            app(PdfPreviewImage::class)->store($this->pdf(), 'x');
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertStringContainsString('troppo grande', $e->getMessage());
        }

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_the_file_name_is_not_guessable(): void
    {
        $this->fakeConverter($this->png());

        $first = app(PdfPreviewImage::class)->store($this->pdf(), 'x');
        $second = app(PdfPreviewImage::class)->store($this->pdf(), 'x');

        $this->assertNotSame($first, $second);
    }

    public function test_a_file_that_is_not_a_pdf_is_refused_before_any_conversion(): void
    {
        $this->app->bind(PdfPreviewConverter::class, fn () => new class implements PdfPreviewConverter
        {
            public function convert(string $pdf): string
            {
                throw new \LogicException('Non doveva essere chiamato');
            }
        });

        foreach (['', 'testo qualsiasi', "\x89PNG\r\n\x1a\n...", '<?php echo 1;', ' %PDF-1.4 (con uno spazio davanti)'] as $content) {
            try {
                app(PdfPreviewImage::class)->store($content, 'x');
                $this->fail('Doveva rifiutare: '.substr($content, 0, 20));
            } catch (PdfConversionFailed $e) {
                $this->assertSame('Il file non è un PDF valido.', $e->getMessage());
            }
        }

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_a_pdf_over_10_mb_is_refused(): void
    {
        $this->fakeConverter($this->png());

        $this->expectException(PdfConversionFailed::class);
        $this->expectExceptionMessage('troppo grande');

        app(PdfPreviewImage::class)->store('%PDF-'.str_repeat('0', PdfPreviewImage::MAX_BYTES), 'x');
    }

    public function test_an_unreadable_image_from_the_converter_is_refused_and_nothing_is_stored(): void
    {
        $this->fakeConverter('questo non è un\'immagine');

        try {
            app(PdfPreviewImage::class)->store($this->pdf(), 'x');
            $this->fail('Doveva fallire');
        } catch (PdfConversionFailed $e) {
            $this->assertStringContainsString('non è leggibile', $e->getMessage());
        }

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_the_real_converter_is_the_default_one(): void
    {
        $this->assertInstanceOf(PdfEditorConverter::class, app(PdfPreviewConverter::class));
    }

    // ---------- pannello ----------

    public function test_a_certification_can_be_created_from_a_pdf(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png(1000, 1400));

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'Attestato da PDF',
                'organization' => 'Boolean',
                'preview' => '',
                'pdf_import' => UploadedFile::fake()->createWithContent('attestato.pdf', $this->pdf()),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $certification = Certification::where('title', 'Attestato da PDF')->firstOrFail();

        $this->assertStringStartsWith('certifications/previews/', $certification->preview_upload);
        Storage::disk('public')->assertExists($certification->preview_upload);
        $this->assertSame([$certification->preview_upload], Storage::disk('public')->allFiles());
        $this->assertSame(1000, $certification->preview_width); // lette dall'immagine
        $this->assertSame(1400, $certification->preview_height);
        // Sul sito arriva l'immagine, mai il PDF
        $this->assertStringEndsWith($certification->preview_upload, $this->getJson('/api/certifications')->json('data.0.preview'));
        $this->assertStringNotContainsString('.pdf', $this->getJson('/api/certifications')->getContent());
    }

    public function test_the_pdf_is_never_saved_on_the_record_or_anywhere_public(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'T',
                'organization' => 'E',
                'pdf_import' => UploadedFile::fake()->createWithContent('segreto.pdf', $this->pdf()),
            ])
            ->call('create');

        $row = (array) \DB::table('certifications')->first();

        $this->assertStringNotContainsString('pdf', strtolower(json_encode($row)));
        $this->assertSame([], array_filter(Storage::disk('public')->allFiles(), fn (string $file): bool => str_ends_with($file, '.pdf')));
    }

    /**
     * I caricamenti di Livewire passano da una cartella temporanea: il PDF non deve restarci dopo la conversione.
     *
     * @return list<string>
     */
    private function temporaryPdfFiles(): array
    {
        // Il disco temporaneo di Livewire (nei test è uno finto, in produzione il disco locale)
        $files = FileUploadConfiguration::storage()->allFiles(FileUploadConfiguration::path());

        return array_values(array_filter($files, fn (string $file): bool => str_ends_with(strtolower($file), '.pdf')));
    }

    public function test_the_temporary_pdf_is_deleted_after_a_successful_conversion(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());
        $before = $this->temporaryPdfFiles();

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'T',
                'organization' => 'E',
                'pdf_import' => UploadedFile::fake()->createWithContent('temporaneo.pdf', $this->pdf()),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertSame(1, Certification::count());
        $this->assertSame($before, $this->temporaryPdfFiles(), 'Il PDF temporaneo è rimasto sul disco');
    }

    public function test_the_check_on_the_temporary_folder_really_sees_an_uploaded_pdf(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());

        Livewire::test(CreateCertification::class)
            ->fillForm(['pdf_import' => UploadedFile::fake()->createWithContent('visibile.pdf', $this->pdf())]);

        // Prima di salvare il PDF temporaneo c'è: se qui non si vedesse, i due test accanto non dimostrerebbero nulla
        $this->assertCount(1, $this->temporaryPdfFiles());
    }

    public function test_the_temporary_pdf_is_deleted_also_when_the_conversion_fails(): void
    {
        $this->actAsAdmin();
        $this->failingConverter();
        $before = $this->temporaryPdfFiles();

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'T',
                'organization' => 'E',
                'pdf_import' => UploadedFile::fake()->createWithContent('temporaneo.pdf', $this->pdf()),
            ])
            ->call('create');

        $this->assertSame(0, Certification::count());
        $this->assertSame($before, $this->temporaryPdfFiles(), 'Il PDF temporaneo è rimasto sul disco');
    }

    public function test_the_pdf_never_reaches_the_model_attributes(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());
        Model::preventSilentlyDiscardingAttributes(); // un campo non previsto sul modello farebbe fallire il salvataggio

        try {
            Livewire::test(CreateCertification::class)
                ->fillForm([
                    'title' => 'T',
                    'organization' => 'E',
                    'pdf_import' => UploadedFile::fake()->createWithContent('a.pdf', $this->pdf()),
                ])
                ->call('create')
                ->assertHasNoFormErrors();
        } finally {
            Model::preventSilentlyDiscardingAttributes(false);
        }

        $this->assertSame(1, Certification::count());
    }

    public function test_the_image_address_is_not_required_when_a_pdf_is_given_but_still_is_without_any_image(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());

        Livewire::test(CreateCertification::class)
            ->fillForm(['title' => 'T', 'organization' => 'E', 'preview' => ''])
            ->call('create')
            ->assertHasFormErrors(['preview' => 'required']);

        $this->assertSame(0, Certification::count());
    }

    public function test_a_failed_conversion_saves_nothing_and_explains_what_to_do(): void
    {
        $this->actAsAdmin();
        $this->failingConverter('Il servizio di conversione non risponde.');

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'Non deve esistere',
                'organization' => 'E',
                'pdf_import' => UploadedFile::fake()->createWithContent('a.pdf', $this->pdf()),
            ])
            ->call('create')
            ->assertNotified('Non sono riuscito a creare l\'immagine dal PDF');

        $this->assertSame(0, Certification::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_a_file_that_only_pretends_to_be_a_pdf_saves_nothing(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());

        Livewire::test(CreateCertification::class)
            ->fillForm([
                'title' => 'Finto PDF',
                'organization' => 'E',
                'pdf_import' => UploadedFile::fake()->createWithContent('finto.pdf', 'sono solo testo'),
            ])
            ->call('create');

        $this->assertSame(0, Certification::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_images_and_other_types_are_not_accepted_in_the_pdf_field(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());

        foreach ([UploadedFile::fake()->image('foto.png'), UploadedFile::fake()->create('pagina.html', 5, 'text/html')] as $file) {
            Livewire::test(CreateCertification::class)
                ->fillForm(['title' => 'T', 'organization' => 'E', 'pdf_import' => $file])
                ->call('create')
                ->assertHasFormErrors(['pdf_import']);
        }

        $this->assertSame(0, Certification::count());
    }

    public function test_a_pdf_over_10_mb_is_rejected_by_the_form(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png());

        Livewire::test(CreateCertification::class)
            ->fillForm(['title' => 'T', 'organization' => 'E', 'pdf_import' => UploadedFile::fake()->create('enorme.pdf', 11000, 'application/pdf')])
            ->call('create')
            ->assertHasFormErrors(['pdf_import']);

        $this->assertSame(0, Certification::count());
    }

    public function test_a_pdf_replaces_the_image_of_an_existing_certification_and_removes_the_old_file(): void
    {
        $this->actAsAdmin();
        $this->fakeConverter($this->png(900, 1200));
        Storage::disk('public')->put('certifications/previews/vecchia.png', 'x');
        $certification = Certification::factory()->create(['title' => 'Da aggiornare', 'preview_upload' => 'certifications/previews/vecchia.png']);

        Livewire::test(EditCertification::class, ['record' => $certification->getKey()])
            ->fillForm(['pdf_import' => UploadedFile::fake()->createWithContent('nuovo.pdf', $this->pdf())])
            ->call('save')
            ->assertHasNoFormErrors();

        $certification->refresh();
        $this->assertNotSame('certifications/previews/vecchia.png', $certification->preview_upload);
        Storage::disk('public')->assertMissing('certifications/previews/vecchia.png');
        Storage::disk('public')->assertExists($certification->preview_upload);
        $this->assertSame('Da aggiornare', $certification->title);
        $this->assertSame(900, $certification->preview_width);
    }

    public function test_editing_without_a_pdf_leaves_the_image_alone(): void
    {
        $this->actAsAdmin();
        $this->failingConverter(); // se venisse chiamato, il salvataggio fallirebbe
        Storage::disk('public')->put('certifications/previews/resta.png', 'x');
        $certification = Certification::factory()->create(['preview_upload' => 'certifications/previews/resta.png']);

        Livewire::test(EditCertification::class, ['record' => $certification->getKey()])
            ->fillForm(['title' => 'Solo il titolo'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('certifications/previews/resta.png', $certification->fresh()->preview_upload);
        Storage::disk('public')->assertExists('certifications/previews/resta.png');
    }

    public function test_a_failed_conversion_on_edit_keeps_the_old_image_and_the_other_data(): void
    {
        $this->actAsAdmin();
        $this->failingConverter();
        Storage::disk('public')->put('certifications/previews/resta.png', 'x');
        $certification = Certification::factory()->create(['title' => 'Prima', 'preview_upload' => 'certifications/previews/resta.png']);

        Livewire::test(EditCertification::class, ['record' => $certification->getKey()])
            ->fillForm(['title' => 'Dopo', 'pdf_import' => UploadedFile::fake()->createWithContent('a.pdf', $this->pdf())])
            ->call('save')
            ->assertNotified('Non sono riuscito a creare l\'immagine dal PDF');

        $certification->refresh();
        $this->assertSame('Prima', $certification->title);
        $this->assertSame('certifications/previews/resta.png', $certification->preview_upload);
        Storage::disk('public')->assertExists('certifications/previews/resta.png');
    }
}
