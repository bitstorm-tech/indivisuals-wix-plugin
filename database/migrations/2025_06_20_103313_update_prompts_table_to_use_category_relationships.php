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
        Schema::table('prompts', function (Blueprint $table) {
            // Add new foreign key columns
            $table->foreignId('category_id')->nullable()->after('name')->constrained('prompt_categories')->nullOnDelete();
            $table->foreignId('subcategory_id')->nullable()->after('category_id')->constrained('prompt_sub_categories')->nullOnDelete();
            
            // Add indexes for better performance
            $table->index('category_id');
            $table->index('subcategory_id');
            
            // Drop the old category column
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prompts', function (Blueprint $table) {
            // Re-add the category column
            $table->string('category')->after('name');
            
            // Drop the foreign key constraints and columns
            $table->dropForeign(['category_id']);
            $table->dropForeign(['subcategory_id']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['subcategory_id']);
            $table->dropColumn(['category_id', 'subcategory_id']);
        });
    }
};
