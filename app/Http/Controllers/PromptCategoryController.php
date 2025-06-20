<?php

namespace App\Http\Controllers;

use App\Models\PromptCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PromptCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = PromptCategory::orderBy('name')->get();

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:prompt_categories',
        ]);

        $category = PromptCategory::create($validated);

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Category created successfully.');
        }

        return response()->json($category, 201);
    }

    public function show(PromptCategory $promptCategory): JsonResponse
    {
        return response()->json($promptCategory);
    }

    public function update(Request $request, PromptCategory $promptCategory): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:prompt_categories,name,'.$promptCategory->id,
        ]);

        $promptCategory->update($validated);

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Category updated successfully.');
        }

        return response()->json($promptCategory);
    }

    public function destroy(PromptCategory $promptCategory): JsonResponse|RedirectResponse
    {
        if ($promptCategory->prompts()->exists()) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['category' => 'Cannot delete category with associated prompts.']);
            }

            return response()->json(['error' => 'Cannot delete category with associated prompts.'], 422);
        }

        $promptCategory->delete();

        if (request()->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Category deleted successfully.');
        }

        return response()->json(null, 204);
    }
}
