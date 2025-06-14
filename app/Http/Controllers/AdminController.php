<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Illuminate\Http\Request;
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

    public function updatePrompt(Request $request, Prompt $prompt)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'prompt' => 'required|string',
            'active' => 'boolean',
        ]);

        $prompt->update($validated);

        return response()->json([
            'success' => true,
            'prompt' => $prompt->fresh(),
        ]);
    }

    public function deletePrompt(Prompt $prompt)
    {
        $prompt->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
