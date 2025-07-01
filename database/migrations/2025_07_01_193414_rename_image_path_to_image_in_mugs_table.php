<?php

use App\Models\Mug;
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
        // First rename the column
        Schema::table('mugs', function (Blueprint $table) {
            $table->renameColumn('image_path', 'image');
        });

        // Then update existing data to store only filename
        Mug::whereNotNull('image')->each(function ($mug) {
            // Strip the 'mugs/' prefix if it exists
            $mug->image = basename($mug->image);
            $mug->save();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First update data back to include path
        Mug::whereNotNull('image')->each(function ($mug) {
            // Add back the 'mugs/' prefix
            $mug->image = 'mugs/'.$mug->image;
            $mug->save();
        });

        // Then rename the column back
        Schema::table('mugs', function (Blueprint $table) {
            $table->renameColumn('image', 'image_path');
        });
    }
};
