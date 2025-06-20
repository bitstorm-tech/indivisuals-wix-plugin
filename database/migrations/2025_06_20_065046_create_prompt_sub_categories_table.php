<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prompt_sub_categories', function (Blueprint $table) {
            $table->id()->startingValue(1000);
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Create default "None" sub-category
        \App\Models\PromptSubCategory::create([
            'id' => 1000,
            'name' => 'None',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_sub_categories');
    }
};
