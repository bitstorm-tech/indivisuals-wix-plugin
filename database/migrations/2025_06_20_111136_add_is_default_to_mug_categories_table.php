<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mug_categories', function (Blueprint $table) {
            $table->boolean('is_default')->default(false);
        });

        // Mark the default category as default
        DB::table('mug_categories')->where('id', 100)->update(['is_default' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mug_categories', function (Blueprint $table) {
            $table->dropColumn('is_default');
        });
    }
};
