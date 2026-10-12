<?php

namespace Database\Factories;

use App\Enums\ContactVariant;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contact>
 */
class ContactFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => fake()->unique()->word(),
            'href' => fake()->url(),
            'icon' => '🔗',
            'aria_label' => fake()->sentence(3),
            'variant' => ContactVariant::Other,
            'position' => fake()->numberBetween(1, 50),
            'hidden' => false,
        ];
    }
}
