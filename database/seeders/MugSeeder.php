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
                'description_short' => 'Classic ceramic mug',
                'description_long' => 'Classic 11oz white ceramic mug',
                'price' => 12.99,
                'image_path' => 'mugs/classic-white.jpg',
                'active' => true,
                'dishwasher_safe' => true,
                'height_mm' => 95,
                'diameter_mm' => 82,
                'filling_quantity' => '325ml',
            ],
            [
                'name' => 'Black Matte Mug',
                'description_short' => 'Stylish matte finish',
                'description_long' => 'Stylish 11oz black matte ceramic mug',
                'price' => 14.99,
                'image_path' => 'mugs/black-matte.jpg',
                'active' => true,
                'dishwasher_safe' => true,
                'height_mm' => 95,
                'diameter_mm' => 82,
                'filling_quantity' => '325ml',
            ],
            [
                'name' => 'Color Changing Mug',
                'description_short' => 'Heat activated design',
                'description_long' => 'Heat reactive 11oz color changing mug',
                'price' => 19.99,
                'image_path' => 'mugs/color-changing.jpg',
                'active' => true,
                'dishwasher_safe' => false,
                'height_mm' => 95,
                'diameter_mm' => 82,
                'filling_quantity' => '325ml',
            ],
            [
                'name' => 'Travel Mug',
                'description_short' => 'Perfect for on-the-go',
                'description_long' => 'Insulated 16oz travel mug',
                'price' => 24.99,
                'image_path' => 'mugs/travel-mug.jpg',
                'active' => true,
                'dishwasher_safe' => true,
                'height_mm' => 150,
                'diameter_mm' => 75,
                'filling_quantity' => '470ml',
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
