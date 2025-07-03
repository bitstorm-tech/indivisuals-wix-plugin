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
        Schema::table('mugs', function (Blueprint $table) {
            $table->text('description_long')->nullable()->after('description');
            $table->text('description_short')->nullable()->after('description_long');
            $table->integer('height_mm')->nullable()->after('description_short');
            $table->integer('diameter_mm')->nullable()->after('height_mm');
            $table->integer('print_template_width_mm')->nullable()->after('diameter_mm');
            $table->integer('print_template_height_mm')->nullable()->after('print_template_width_mm');
            $table->text('filling_quantity')->nullable()->after('print_template_height_mm');
            $table->boolean('dishwasher_safe')->default(true)->after('filling_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mugs', function (Blueprint $table) {
            $table->dropColumn([
                'description_long',
                'description_short',
                'height_mm',
                'diameter_mm',
                'print_template_width_mm',
                'print_template_height_mm',
                'filling_quantity',
                'dishwasher_safe',
            ]);
        });
    }
};
