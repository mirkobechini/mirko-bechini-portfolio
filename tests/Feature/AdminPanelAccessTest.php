<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPanelAccessTest extends TestCase
{
    use RefreshDatabase;

    private const TWO_FACTOR_SETUP = '/admin/multi-factor-authentication/set-up';

    public function test_a_guest_is_sent_to_the_login_page(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_the_login_page_is_the_panel_not_the_portfolio_spa(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertDontSee('id="root"', false);
    }

    public function test_a_user_who_is_not_an_admin_cannot_enter(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_an_admin_without_two_factor_is_forced_to_set_it_up(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin')->assertRedirect(self::TWO_FACTOR_SETUP);
    }

    public function test_an_admin_with_two_factor_enabled_gets_the_dashboard(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->saveAppAuthenticationSecret('JBSWY3DPEHPK3PXP');

        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_is_admin_cannot_be_mass_assigned(): void
    {
        $user = User::create([
            'name' => 'Intruso',
            'email' => 'intruso@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);

        $this->assertFalse($user->fresh()->is_admin);
    }

    public function test_a_new_user_is_not_an_admin_by_default(): void
    {
        $this->assertFalse(User::factory()->create()->fresh()->is_admin);
    }

    public function test_there_is_no_public_registration(): void
    {
        $this->get('/admin/register')->assertNotFound();
    }

    public function test_the_portfolio_still_works_next_to_the_panel(): void
    {
        $this->get('/')->assertOk()->assertSee('id="root"', false);
        $this->get('/pagina-che-non-esiste')->assertNotFound()->assertSee('id="root"', false);
    }
}
