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
        Schema::create('mugs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->foreignId('category_id')->nullable()->constrained('mug_categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('mug_sub_categories')->nullOnDelete();
            $table->string('image_path')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->index('name');
            $table->index('status');
            $table->index(['category_id', 'subcategory_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mugs');
    }
};
