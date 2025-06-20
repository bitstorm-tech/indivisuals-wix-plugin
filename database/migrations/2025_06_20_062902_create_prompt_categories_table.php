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
        Schema::create('prompt_categories', function (Blueprint $table) {
            $table->id()->startingValue(100);
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Create default "None" category
        \App\Models\PromptCategory::create([
            'id' => 100,
            'name' => 'None',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_categories');
    }
};