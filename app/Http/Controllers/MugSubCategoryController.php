<?php

namespace App\Http\Controllers;

use App\Models\MugSubCategory;
use Illuminate\Http\Request;

class MugSubCategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:mug_categories,id',
        ]);

        MugSubCategory::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, MugSubCategory $mugSubCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:mug_categories,id',
        ]);

        $mugSubCategory->update($validated);

        return redirect()->back();
    }

    public function destroy(MugSubCategory $mugSubCategory)
    {
        // Check if subcategory has mugs
        if ($mugSubCategory->mugs()->exists()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete subcategory with mugs']);
        }

        $mugSubCategory->delete();

        return redirect()->back();
    }
}
