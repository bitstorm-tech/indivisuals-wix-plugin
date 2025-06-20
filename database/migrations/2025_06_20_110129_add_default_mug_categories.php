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
        // Insert default "None" category with ID 100
        DB::table('mug_categories')->insert([
            'id' => 100,
            'name' => 'None',
            'description' => 'Default category for uncategorized mugs',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update sequence to continue from 101 for PostgreSQL
        DB::statement('ALTER SEQUENCE mug_categories_id_seq RESTART WITH 101');

        // Insert default "None" subcategory with ID 1000
        DB::table('mug_sub_categories')->insert([
            'id' => 1000,
            'name' => 'None',
            'description' => 'Default subcategory for uncategorized mugs',
            'category_id' => 100,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update sequence to continue from 1001 for PostgreSQL
        DB::statement('ALTER SEQUENCE mug_sub_categories_id_seq RESTART WITH 1001');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete the default subcategory first (due to foreign key constraint)
        DB::table('mug_sub_categories')->where('id', 1000)->delete();

        // Delete the default category
        DB::table('mug_categories')->where('id', 100)->delete();

        // Reset sequences for PostgreSQL
        DB::statement('ALTER SEQUENCE mug_categories_id_seq RESTART WITH 1');
        DB::statement('ALTER SEQUENCE mug_sub_categories_id_seq RESTART WITH 1');
    }
};
