<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete default prompt subcategory with ID 1000
        DB::table('prompt_sub_categories')->where('id', 1000)->delete();

        // Delete default mug subcategory with ID 1000
        DB::table('mug_sub_categories')->where('id', 1000)->delete();

        // Delete default prompt category with ID 100
        DB::table('prompt_categories')->where('id', 100)->delete();

        // Delete default mug category with ID 100
        DB::table('mug_categories')->where('id', 100)->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-insert default mug category
        DB::table('mug_categories')->insert([
            'id' => 100,
            'name' => 'None',
            'description' => 'Default category for uncategorized mugs',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Re-insert default mug subcategory
        DB::table('mug_sub_categories')->insert([
            'id' => 1000,
            'name' => 'None',
            'description' => 'Default subcategory for uncategorized mugs',
            'category_id' => 100,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Re-insert default prompt category
        DB::table('prompt_categories')->insert([
            'id' => 100,
            'name' => 'None',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Re-insert default prompt subcategory
        DB::table('prompt_sub_categories')->insert([
            'id' => 1000,
            'name' => 'None',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
