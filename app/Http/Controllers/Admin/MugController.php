<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mug;
use App\Models\MugCategory;
use App\Models\MugSubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MugController extends Controller
{
    public function index()
    {
        $mugs = Mug::with(['category', 'subcategory'])
            ->where('active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        // Add virtual field for image URL
        $mugs->each(function ($mug) {
            $mug->image_url = $mug->getImageUrl();
        });

        // Check if it's an API request
        if (request()->is('api/*')) {
            return response()->json($mugs);
        }

        $categories = MugCategory::orderBy('name')->get();
        $subcategories = MugSubCategory::orderBy('name')->get();

        return Inertia::render('admin/mugs', [
            'mugs' => $mugs,
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function show(Mug $mug)
    {
        $mug->load(['category', 'subcategory']);
        $mug->image_url = $mug->getImageUrl();

        return response()->json($mug);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description_long' => 'nullable|string',
            'description_short' => 'nullable|string',
            'height_mm' => 'nullable|integer|min:0',
            'diameter_mm' => 'nullable|integer|min:0',
            'print_template_width_mm' => 'nullable|integer|min:0',
            'print_template_height_mm' => 'nullable|integer|min:0',
            'filling_quantity' => 'nullable|string|max:255',
            'dishwasher_safe' => 'required|boolean',
            'price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:mug_categories,id',
            'subcategory_id' => 'nullable|exists:mug_sub_categories,id',
            'image' => 'nullable|image|max:10240', // 10MB max
            'active' => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mugs', 'public');
            $validated['image_path'] = $path;
        }

        Mug::create($validated);

        return redirect()->route('admin.mugs');
    }

    public function update(Request $request, Mug $mug)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description_long' => 'nullable|string',
            'description_short' => 'nullable|string',
            'height_mm' => 'nullable|integer|min:0',
            'diameter_mm' => 'nullable|integer|min:0',
            'print_template_width_mm' => 'nullable|integer|min:0',
            'print_template_height_mm' => 'nullable|integer|min:0',
            'filling_quantity' => 'nullable|string|max:255',
            'dishwasher_safe' => 'required|boolean',
            'price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:mug_categories,id',
            'subcategory_id' => 'nullable|exists:mug_sub_categories,id',
            'image' => 'nullable|image|max:10240', // 10MB max
            'active' => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($mug->image_path) {
                Storage::disk('public')->delete($mug->image_path);
            }

            $path = $request->file('image')->store('mugs', 'public');
            $validated['image_path'] = $path;
        }

        $mug->update($validated);

        return redirect()->route('admin.mugs');
    }

    public function destroy(Mug $mug)
    {
        // Delete image if exists
        if ($mug->image_path) {
            Storage::disk('public')->delete($mug->image_path);
        }

        $mug->delete();

        return redirect()->route('admin.mugs');
    }

    public function categories()
    {
        $categories = MugCategory::withCount(['mugs', 'subcategories'])
            ->orderBy('name')
            ->get();

        $subcategories = MugSubCategory::with('category')
            ->withCount('mugs')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/mug-categories', [
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    // Category methods
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:mug_categories',
            'description' => 'nullable|string',
        ]);

        MugCategory::create($validated);

        return redirect()->back();
    }

    public function updateCategory(Request $request, MugCategory $mugCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:mug_categories,name,'.$mugCategory->id,
            'description' => 'nullable|string',
        ]);

        $mugCategory->update($validated);

        return redirect()->back();
    }

    public function destroyCategory(MugCategory $mugCategory)
    {
        // Check if category has mugs or subcategories
        if ($mugCategory->mugs()->exists() || $mugCategory->subcategories()->exists()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete category with mugs or subcategories']);
        }

        $mugCategory->delete();

        return redirect()->back();
    }

    // SubCategory methods
    public function storeSubCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:mug_categories,id',
        ]);

        MugSubCategory::create($validated);

        return redirect()->back();
    }

    public function updateSubCategory(Request $request, MugSubCategory $mugSubCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:mug_categories,id',
        ]);

        $mugSubCategory->update($validated);

        return redirect()->back();
    }

    public function destroySubCategory(MugSubCategory $mugSubCategory)
    {
        // Check if subcategory has mugs
        if ($mugSubCategory->mugs()->exists()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete subcategory with mugs']);
        }

        $mugSubCategory->delete();

        return redirect()->back();
    }
}
