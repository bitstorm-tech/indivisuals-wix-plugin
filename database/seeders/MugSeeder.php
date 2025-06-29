<?php

namespace Database\Seeders;

use App\Models\Mug;
use Illuminate\Database\Seeder;

class MugSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mugs = [
            [
                'name' => 'Classic White Mug',
                'description' => 'Classic 11oz white ceramic mug',
                'price' => 12.99,
                'image_path' => 'mugs/classic-white.jpg',
                'active' => true,
            ],
            [
                'name' => 'Black Matte Mug',
                'description' => 'Stylish 11oz black matte ceramic mug',
                'price' => 14.99,
                'image_path' => 'mugs/black-matte.jpg',
                'active' => true,
            ],
            [
                'name' => 'Color Changing Mug',
                'description' => 'Heat reactive 11oz color changing mug',
                'price' => 19.99,
                'image_path' => 'mugs/color-changing.jpg',
                'active' => true,
            ],
            [
                'name' => 'Travel Mug',
                'description' => 'Insulated 16oz travel mug',
                'price' => 24.99,
                'image_path' => 'mugs/travel-mug.jpg',
                'active' => true,
            ],
        ];

        foreach ($mugs as $mug) {
            Mug::updateOrCreate(
                ['name' => $mug['name']],
                $mug
            );
        }
    }
}
