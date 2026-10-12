<?php

namespace Database\Factories;

use App\Models\Certification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certification>
 */
class CertificationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(4),
            'preview' => '/modals/certifications/'.fake()->word().'.webp',
            'preview_width' => 1320,
            'preview_height' => 840,
            'link' => null,
            'organization' => fake()->company(),
            'organization_url' => fake()->url(),
            'skills' => [],
            'course_id' => null,
            'position' => fake()->numberBetween(1, 50),
            'hidden' => false,
        ];
    }
}
