<?php

namespace Tests\Feature;

use App\Enums\ContactVariant;
use App\Filament\Resources\Contacts\Pages\CreateContact;
use App\Filament\Resources\Contacts\Pages\EditContact;
use App\Filament\Resources\Contacts\Pages\ListContacts;
use App\Models\Contact;
use App\Models\User;
use Database\Seeders\ContactSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ContactsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<array<string, mixed>>
     */
    private function contacts(): array
    {
        return $this->getJson('/api/contacts')->assertOk()->json('data');
    }

    private function actAsAdmin(): void
    {
        Filament::setCurrentPanel('admin');
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');
        $this->actingAs($admin);
    }

    // ---------- API ----------

    public function test_the_api_returns_the_shape_the_contacts_window_uses(): void
    {
        $contact = Contact::factory()->create([
            'label' => 'Email',
            'href' => 'mailto:me@example.com',
            'icon' => '✉️',
            'aria_label' => 'Contatta via email',
            'variant' => ContactVariant::Mail,
        ]);

        $this->assertSame([[
            'id' => $contact->id,
            'href' => 'mailto:me@example.com',
            'icon' => '✉️',
            'label' => 'Email',
            'variantClass' => 'mail',
            'ariaLabel' => 'Contatta via email',
        ]], $this->contacts());
    }

    public function test_hidden_contacts_are_not_exposed_and_order_follows_position(): void
    {
        Contact::factory()->create(['label' => 'Secondo', 'position' => 2]);
        Contact::factory()->create(['label' => 'Primo', 'position' => 1]);
        Contact::factory()->create(['label' => 'Nascosto', 'hidden' => true]);

        $this->assertSame(['Primo', 'Secondo'], array_column($this->contacts(), 'label'));
    }

    public function test_the_response_is_cacheable_and_supports_304(): void
    {
        Contact::factory()->create();
        $first = $this->getJson('/api/contacts')->assertOk();

        $this->assertMatchesRegularExpression('/s-maxage=60(,|$)/', $first->headers->get('Cache-Control'));
        $this->getJson('/api/contacts', ['If-None-Match' => $first->headers->get('ETag')])->assertStatus(304);
    }

    public function test_changes_refresh_the_api(): void
    {
        $contact = Contact::factory()->create(['label' => 'Prima']);
        $this->assertSame('Prima', $this->contacts()[0]['label']);

        $contact->update(['label' => 'Dopo']);
        $this->assertSame('Dopo', $this->contacts()[0]['label']);

        $contact->delete();
        $this->assertSame([], $this->contacts());
    }

    /**
     * La finestra legge questi campi (stessa forma di contactsData.js, che fa anche da fallback).
     */
    public function test_the_fields_match_the_static_contacts_data(): void
    {
        $js = file_get_contents(base_path('resources/js/src/features/modals/contacts/contactsData.js'));
        preg_match('/const contacts = \[\s*\{(.*?)\n    \},/s', $js, $block);
        preg_match_all('/^\s{8}([a-zA-Z]+):/m', $block[1] ?? '', $keys);

        Contact::factory()->create();

        $this->assertNotEmpty($keys[1], 'Non riesco a leggere i campi di contactsData.js');
        $this->assertEqualsCanonicalizing($keys[1], array_keys($this->contacts()[0]));
    }

    /**
     * Le varianti sono le classi CSS della card: se ne manca una, il bordo non si vede.
     */
    public function test_every_variant_has_a_css_class(): void
    {
        $css = file_get_contents(base_path('resources/js/src/features/modals/contacts/ContactsModal.module.css'));

        foreach (ContactVariant::cases() as $variant) {
            $this->assertStringContainsString('.'.$variant->value.' {', $css, $variant->value);
        }
    }

    // ---------- seeder ----------

    public function test_the_seeder_imports_the_three_contacts_and_is_repeatable(): void
    {
        $this->seed(ContactSeeder::class);
        Contact::where('label', 'Email')->update(['href' => 'mailto:nuovo@example.com']);
        $this->seed(ContactSeeder::class);

        $this->assertSame(3, Contact::count());
        $this->assertSame('mailto:nuovo@example.com', Contact::where('label', 'Email')->value('href'));
        $this->assertSame(['mail', 'linkedin', 'github'], Contact::orderBy('position')->get()->map(fn (Contact $c) => $c->variant->value)->all());
    }

    // ---------- pannello ----------

    public function test_the_admin_can_list_create_and_edit_contacts(): void
    {
        $this->actAsAdmin();
        $existing = Contact::factory()->create();

        Livewire::test(ListContacts::class)->assertCanSeeTableRecords([$existing]);

        Livewire::test(CreateContact::class)
            ->fillForm([
                'label' => 'Telefono',
                'icon' => '📞',
                'href' => 'tel:+390000000',
                'aria_label' => 'Chiama',
                'variant' => ContactVariant::Other,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertTrue(Contact::where('label', 'Telefono')->exists());

        Livewire::test(EditContact::class, ['record' => $existing->getKey()])
            ->fillForm(['label' => 'Cambiato'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Cambiato', $existing->fresh()->label);
    }

    public function test_dangerous_addresses_are_rejected_and_safe_ones_accepted(): void
    {
        $this->actAsAdmin();
        $base = ['label' => 'X', 'icon' => '🔗', 'aria_label' => 'X', 'variant' => ContactVariant::Other];

        foreach (['javascript:alert(1)', 'data:text/html,hi', 'ftp://example.com', '//example.com', 'https://', 'https://a b.com', 'esempio.it'] as $href) {
            Livewire::test(CreateContact::class)
                ->fillForm($base + ['href' => $href])
                ->call('create')
                ->assertHasFormErrors(['href']);
        }

        foreach (['https://example.com/x', 'http://example.com', 'mailto:a@b.it', 'tel:+39123'] as $href) {
            Livewire::test(CreateContact::class)
                ->fillForm($base + ['href' => $href, 'label' => $href])
                ->call('create')
                ->assertHasNoFormErrors();
        }
    }

    public function test_required_fields_are_validated(): void
    {
        $this->actAsAdmin();

        Livewire::test(CreateContact::class)
            ->fillForm(['label' => '', 'icon' => '', 'href' => '', 'aria_label' => ''])
            ->call('create')
            ->assertHasFormErrors(['label' => 'required', 'icon' => 'required', 'href' => 'required', 'aria_label' => 'required']);
    }

    public function test_the_page_requires_an_admin(): void
    {
        $this->get('/admin/contacts')->assertRedirect();
    }
}
