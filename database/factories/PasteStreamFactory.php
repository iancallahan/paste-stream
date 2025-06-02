<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PasteStream>
 */
class PasteStreamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'pastes' => [
                [
                    'content' => fake()->paragraph(),
                    'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
                ],
                [
                    'content' => fake()->paragraph(),
                    'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
                ],
                [
                    'content' => fake()->paragraph(),
                    'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
                ],
            ],
            'public' => false,
            'uuid' => fake()->uuid(),
            'default' => false,
        ];
    }
}
