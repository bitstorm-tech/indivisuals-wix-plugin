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
        // Get the current max IDs
        $maxMugCategoryId = DB::table('mug_categories')->max('id') ?? 100;
        $maxMugSubCategoryId = DB::table('mug_sub_categories')->max('id') ?? 1000;
        $maxPromptCategoryId = DB::table('prompt_categories')->max('id') ?? 100;
        $maxPromptSubCategoryId = DB::table('prompt_sub_categories')->max('id') ?? 1000;

        if (DB::getDriverName() === 'pgsql') {
            // For PostgreSQL, set sequences to next available value
            DB::statement('ALTER SEQUENCE mug_categories_id_seq RESTART WITH '.($maxMugCategoryId + 1));
            DB::statement('ALTER SEQUENCE mug_sub_categories_id_seq RESTART WITH '.($maxMugSubCategoryId + 1));
            DB::statement('ALTER SEQUENCE prompt_categories_id_seq RESTART WITH '.($maxPromptCategoryId + 1));
            DB::statement('ALTER SEQUENCE prompt_sub_categories_id_seq RESTART WITH '.($maxPromptSubCategoryId + 1));
        } elseif (DB::getDriverName() === 'mysql') {
            // For MySQL
            DB::statement('ALTER TABLE mug_categories AUTO_INCREMENT = '.($maxMugCategoryId + 1));
            DB::statement('ALTER TABLE mug_sub_categories AUTO_INCREMENT = '.($maxMugSubCategoryId + 1));
            DB::statement('ALTER TABLE prompt_categories AUTO_INCREMENT = '.($maxPromptCategoryId + 1));
            DB::statement('ALTER TABLE prompt_sub_categories AUTO_INCREMENT = '.($maxPromptSubCategoryId + 1));
        } elseif (DB::getDriverName() === 'sqlite') {
            // For SQLite
            DB::statement("UPDATE sqlite_sequence SET seq = {$maxMugCategoryId} WHERE name = 'mug_categories'");
            DB::statement("UPDATE sqlite_sequence SET seq = {$maxMugSubCategoryId} WHERE name = 'mug_sub_categories'");
            DB::statement("UPDATE sqlite_sequence SET seq = {$maxPromptCategoryId} WHERE name = 'prompt_categories'");
            DB::statement("UPDATE sqlite_sequence SET seq = {$maxPromptSubCategoryId} WHERE name = 'prompt_sub_categories'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed as we don't know the previous sequence values
    }
};
