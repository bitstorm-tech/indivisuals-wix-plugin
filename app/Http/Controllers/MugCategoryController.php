<?php

namespace App\Http\Controllers;

use App\Models\MugCategory;
use Illuminate\Http\Request;

class MugCategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:mug_categories',
            'description' => 'nullable|string',
        ]);

        MugCategory::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, MugCategory $mugCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:mug_categories,name,'.$mugCategory->id,
            'description' => 'nullable|string',
        ]);

        $mugCategory->update($validated);

        return redirect()->back();
    }

    public function destroy(MugCategory $mugCategory)
    {
        // Check if category has mugs or subcategories
        if ($mugCategory->mugs()->exists() || $mugCategory->subcategories()->exists()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete category with mugs or subcategories']);
        }

        $mugCategory->delete();

        return redirect()->back();
    }
}
