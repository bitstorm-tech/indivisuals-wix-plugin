<?php

namespace App\Http\Controllers;

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
            ->orderBy('created_at', 'desc')
            ->get();

        // Add virtual field for image URL
        $mugs->each(function ($mug) {
            $mug->image_url = $mug->getImageUrl();
        });

        $categories = MugCategory::orderBy('name')->get();
        $subcategories = MugSubCategory::orderBy('name')->get();

        return Inertia::render('admin/Mugs', [
            'mugs' => $mugs,
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:mug_categories,id',
            'subcategory_id' => 'nullable|exists:mug_sub_categories,id',
            'image' => 'nullable|image|max:10240', // 10MB max
            'status' => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('mugs', 'private');
            $validated['image_path'] = $path;
        }

        Mug::create($validated);

        return redirect()->route('admin.mugs');
    }

    public function update(Request $request, Mug $mug)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:mug_categories,id',
            'subcategory_id' => 'nullable|exists:mug_sub_categories,id',
            'image' => 'nullable|image|max:10240', // 10MB max
            'status' => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($mug->image_path) {
                Storage::disk('private')->delete($mug->image_path);
            }

            $path = $request->file('image')->store('mugs', 'private');
            $validated['image_path'] = $path;
        }

        $mug->update($validated);

        return redirect()->route('admin.mugs');
    }

    public function destroy(Mug $mug)
    {
        // Delete image if exists
        if ($mug->image_path) {
            Storage::disk('private')->delete($mug->image_path);
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

        return Inertia::render('admin/mugs/Categories', [
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function subcategories()
    {
        $subcategories = MugSubCategory::with('category')
            ->withCount('mugs')
            ->orderBy('name')
            ->get();

        $categories = MugCategory::orderBy('name')->get();

        return Inertia::render('admin/mugs/SubCategories', [
            'subcategories' => $subcategories,
            'categories' => $categories,
        ]);
    }
}
