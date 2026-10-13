<?php

namespace Database\Factories;

use App\Enums\FormationStepKind;
use App\Enums\FormationStepStatus;
use App\Models\FormationStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FormationStep>
 */
class FormationStepFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kind' => FormationStepKind::Roadmap,
            'title' => fake()->unique()->sentence(3),
            'description' => fake()->sentence(),
            'status' => FormationStepStatus::Next,
            'badge' => null,
            'position' => fake()->numberBetween(1, 50),
            'hidden' => false,
        ];
    }
}
