<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $prompts = Prompt::all();

        // Add virtual field to indicate if prompt has example image
        $prompts->each(function ($prompt) {
            $prompt->has_example_image = $prompt->hasExampleImage();
        });

        return Inertia::render('admin', [
            'prompts' => $prompts,
        ]);
    }
}
