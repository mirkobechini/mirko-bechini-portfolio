<?php

namespace Database\Factories;

use App\Enums\CourseStatus;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course' => fake()->unique()->sentence(3),
            'description' => fake()->sentence(),
            'certificate' => null,
            'organization' => fake()->company(),
            'organization_url' => fake()->url(),
            'period' => '01/2026 - 02/2026',
            'status' => CourseStatus::Completed,
            'skills' => [],
            'highlights' => [],
            'modules' => [],
            'position' => fake()->numberBetween(1, 50),
            'hidden' => false,
        ];
    }
}
