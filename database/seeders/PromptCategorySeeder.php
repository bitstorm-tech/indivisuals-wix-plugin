<?php

namespace Database\Seeders;

use App\Models\PromptCategory;
use Illuminate\Database\Seeder;

class PromptCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PromptCategory::firstOrCreate(
            ['id' => 100],
            ['name' => 'None']
        );
    }
}
