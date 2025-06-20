<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create prompt_categories table
        Schema::create('prompt_categories', function (Blueprint $table) {
            $table->id()->startingValue(101);
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Create prompt_sub_categories table
        Schema::create('prompt_sub_categories', function (Blueprint $table) {
            $table->id()->startingValue(1001);
            $table->foreignId('category_id')->nullable()->constrained('prompt_categories')->nullOnDelete();
            $table->string('name')->unique();
            $table->timestamps();

            $table->index('category_id');
        });

        // Create prompts table
        Schema::create('prompts', function (Blueprint $table) {
            $table->id()->startingValue(1_000_001);
            $table->timestamps();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('prompt_categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('prompt_sub_categories')->nullOnDelete();
            $table->text('prompt');
            $table->string('example_image_filename')->nullable();
            $table->boolean('active')->default(true);

            $table->index('category_id');
            $table->index('subcategory_id');
        });

        // Create mug_categories table
        Schema::create('mug_categories', function (Blueprint $table) {
            $table->id()->startingValue(1_000_001);
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Create mug_sub_categories table
        Schema::create('mug_sub_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('mug_categories')->onDelete('cascade');
            $table->timestamps();

            $table->index(['category_id', 'name']);
        });

        // Create mugs table
        Schema::create('mugs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price');
            $table->foreignId('category_id')->nullable()->constrained('mug_categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('mug_sub_categories')->nullOnDelete();
            $table->string('image_path')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->index('name');
            $table->index('status');
            $table->index(['category_id', 'subcategory_id']);
        });

        // Set up proper ID sequences
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER SEQUENCE mug_categories_id_seq RESTART WITH 101');
            DB::statement('ALTER SEQUENCE mug_sub_categories_id_seq RESTART WITH 1001');
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE mug_categories AUTO_INCREMENT = 101');
            DB::statement('ALTER TABLE mug_sub_categories AUTO_INCREMENT = 1001');
        } elseif (DB::getDriverName() === 'sqlite') {
            // SQLite will handle this automatically after the first insert
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mugs');
        Schema::dropIfExists('mug_sub_categories');
        Schema::dropIfExists('mug_categories');
        Schema::dropIfExists('prompts');
        Schema::dropIfExists('prompt_sub_categories');
        Schema::dropIfExists('prompt_categories');
    }
};
