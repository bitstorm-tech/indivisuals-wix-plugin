<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $prompts = Prompt::all();

        // Add virtual field for example image URL
        $prompts->each(function ($prompt) {
            $prompt->example_image_url = $prompt->getExampleImageUrl();
        });

        $categories = Prompt::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('admin', [
            'prompts' => $prompts,
            'categories' => $categories,
        ]);
    }
}
