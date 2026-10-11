<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $repo = fake()->unique()->slug(2);

        return [
            'github_repo' => $repo,
            'title' => Str::headline($repo),
            'description_it' => fake()->sentence(),
            'type' => fake()->randomElement(['frontend', 'backend', 'fullstack']),
            'scope' => fake()->randomElement(['personal', 'work']),
            'technologies' => ['PHP', 'Laravel'],
            'extra_technologies' => [],
            'repo_url' => "https://github.com/mirkobechini/{$repo}",
            'live_url' => null,
            'stars' => fake()->numberBetween(0, 50),
            'pushed_at' => fake()->dateTimeBetween('-1 year'),
            'pinned' => false,
            'hidden' => false,
            'synced_at' => now(),
        ];
    }

    public function pinned(): static
    {
        return $this->state(['pinned' => true]);
    }

    public function hidden(): static
    {
        return $this->state(['hidden' => true]);
    }
}
