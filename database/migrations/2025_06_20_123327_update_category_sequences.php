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
        // For SQLite, we need to update the sqlite_sequence table
        if (DB::getDriverName() === 'sqlite') {
            // Update mug_categories sequence to start from 101
            DB::statement("UPDATE sqlite_sequence SET seq = 100 WHERE name = 'mug_categories'");

            // Update mug_sub_categories sequence to start from 1001
            DB::statement("UPDATE sqlite_sequence SET seq = 1000 WHERE name = 'mug_sub_categories'");

            // Update prompt_categories sequence to start from 101
            DB::statement("UPDATE sqlite_sequence SET seq = 100 WHERE name = 'prompt_categories'");

            // Update prompt_sub_categories sequence to start from 1001
            DB::statement("UPDATE sqlite_sequence SET seq = 1000 WHERE name = 'prompt_sub_categories'");
        } elseif (DB::getDriverName() === 'pgsql') {
            // For PostgreSQL
            DB::statement('ALTER SEQUENCE mug_categories_id_seq RESTART WITH 101');
            DB::statement('ALTER SEQUENCE mug_sub_categories_id_seq RESTART WITH 1001');
            DB::statement('ALTER SEQUENCE prompt_categories_id_seq RESTART WITH 101');
            DB::statement('ALTER SEQUENCE prompt_sub_categories_id_seq RESTART WITH 1001');
        } elseif (DB::getDriverName() === 'mysql') {
            // For MySQL
            DB::statement('ALTER TABLE mug_categories AUTO_INCREMENT = 101');
            DB::statement('ALTER TABLE mug_sub_categories AUTO_INCREMENT = 1001');
            DB::statement('ALTER TABLE prompt_categories AUTO_INCREMENT = 101');
            DB::statement('ALTER TABLE prompt_sub_categories AUTO_INCREMENT = 1001');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset sequences back to 1
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'mug_categories'");
            DB::statement("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'mug_sub_categories'");
            DB::statement("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'prompt_categories'");
            DB::statement("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'prompt_sub_categories'");
        } elseif (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER SEQUENCE mug_categories_id_seq RESTART WITH 1');
            DB::statement('ALTER SEQUENCE mug_sub_categories_id_seq RESTART WITH 1');
            DB::statement('ALTER SEQUENCE prompt_categories_id_seq RESTART WITH 1');
            DB::statement('ALTER SEQUENCE prompt_sub_categories_id_seq RESTART WITH 1');
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE mug_categories AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE mug_sub_categories AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE prompt_categories AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE prompt_sub_categories AUTO_INCREMENT = 1');
        }
    }
};
