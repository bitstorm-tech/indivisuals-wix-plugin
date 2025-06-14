<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PromptController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Prompt::query();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $prompts = $query->orderBy('category')->orderBy('name')->get();

        // Add virtual field to indicate if prompt has example image
        $prompts->each(function ($prompt) {
            $prompt->has_example_image = $prompt->hasExampleImage();
        });

        return response()->json($prompts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'prompt' => 'required|string',
            'active' => 'required|in:true,false',
            'example_image' => 'nullable|image|max:5120', // 5MB max
        ]);
        
        // Convert active string to boolean
        $validated['active'] = $validated['active'] === 'true';

        // Don't pass the file to the constructor
        $promptData = collect($validated)->except('example_image')->toArray();
        $prompt = new Prompt($promptData);

        if ($request->hasFile('example_image')) {
            $prompt->setExampleImageFromFile($request->file('example_image'));
        }

        $prompt->save();
        $prompt->has_example_image = $prompt->hasExampleImage();

        return response()->json($prompt, 201);
    }

    public function show(Prompt $prompt): JsonResponse
    {
        $prompt->has_example_image = $prompt->hasExampleImage();
        return response()->json($prompt);
    }

    public function update(Request $request, Prompt $prompt): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'prompt' => 'sometimes|string',
            'active' => 'boolean',
            'example_image' => 'nullable|image|max:5120', // 5MB max
            'remove_example_image' => 'boolean',
        ]);

        // Handle removal of example image
        if ($request->boolean('remove_example_image')) {
            $prompt->example_image = null;
            $prompt->example_image_mime_type = null;
        }
        // Handle new example image upload
        elseif ($request->hasFile('example_image')) {
            $prompt->setExampleImageFromFile($request->file('example_image'));
        }

        // Update other fields
        $prompt->fill($validated);
        $prompt->save();

        $prompt->has_example_image = $prompt->hasExampleImage();

        return response()->json($prompt);
    }

    public function destroy(Prompt $prompt): JsonResponse
    {
        $prompt->delete();

        return response()->json(null, 204);
    }

    public function categories(): JsonResponse
    {
        $categories = Prompt::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }

    public function exampleImage(Prompt $prompt): Response
    {
        if (!$prompt->hasExampleImage()) {
            abort(404, 'Prompt has no example image');
        }

        return response($prompt->example_image)
            ->header('Content-Type', $prompt->example_image_mime_type)
            ->header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    }
}
