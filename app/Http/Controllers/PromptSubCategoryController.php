<?php

namespace App\Http\Controllers;

use App\Models\PromptSubCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PromptSubCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subCategories = PromptSubCategory::orderBy('name')->get();

        return response()->json($subCategories);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:prompt_sub_categories',
            'category_id' => 'nullable|exists:prompt_categories,id',
        ]);

        $subCategory = PromptSubCategory::create($validated);

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Sub-category created successfully.');
        }

        return response()->json($subCategory, 201);
    }

    public function show(PromptSubCategory $promptSubCategory): JsonResponse
    {
        return response()->json($promptSubCategory);
    }

    public function update(Request $request, PromptSubCategory $promptSubCategory): JsonResponse|RedirectResponse
    {
        // Prevent modification of the default "None" sub-category
        if ($promptSubCategory->id === 1000) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->withErrors(['sub_category' => 'Cannot modify the default "None" sub-category.']);
            }

            return response()->json(['error' => 'Cannot modify the default "None" sub-category.'], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:prompt_sub_categories,name,'.$promptSubCategory->id,
            'category_id' => 'nullable|exists:prompt_categories,id',
        ]);

        $promptSubCategory->update($validated);

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Sub-category updated successfully.');
        }

        return response()->json($promptSubCategory);
    }

    public function destroy(PromptSubCategory $promptSubCategory): JsonResponse|RedirectResponse
    {
        // Prevent deletion of the default "None" sub-category
        if ($promptSubCategory->id === 1000) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['sub_category' => 'Cannot delete the default "None" sub-category.']);
            }

            return response()->json(['error' => 'Cannot delete the default "None" sub-category.'], 422);
        }

        if ($promptSubCategory->prompts()->exists()) {
            if (request()->header('X-Inertia')) {
                return redirect()->back()->withErrors(['sub_category' => 'Cannot delete sub-category with associated prompts.']);
            }

            return response()->json(['error' => 'Cannot delete sub-category with associated prompts.'], 422);
        }

        $promptSubCategory->delete();

        if (request()->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Sub-category deleted successfully.');
        }

        return response()->json(null, 204);
    }
}
