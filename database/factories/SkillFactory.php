<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'icon' => '/modals/skills/icons/'.fake()->word().'.webp',
            'category' => fake()->randomElement(['Frontend', 'Backend', 'Database']),
            'color' => fake()->hexColor(),
            'functions' => [fake()->sentence()],
            'extra_projects' => [],
            'position' => fake()->numberBetween(1, 50),
            'hidden' => false,
        ];
    }
}
