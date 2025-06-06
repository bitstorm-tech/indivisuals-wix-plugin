<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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

        return response()->json($prompts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'prompt' => 'required|string',
            'active' => 'boolean',
        ]);

        $prompt = Prompt::create($validated);

        return response()->json($prompt, 201);
    }

    public function show(Prompt $prompt): JsonResponse
    {
        return response()->json($prompt);
    }

    public function update(Request $request, Prompt $prompt): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'prompt' => 'sometimes|string',
            'active' => 'boolean',
        ]);

        $prompt->update($validated);

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
}
