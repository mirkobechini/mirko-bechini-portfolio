<?php

namespace Database\Factories;

use App\Models\ProjectGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectGroup>
 */
class ProjectGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
