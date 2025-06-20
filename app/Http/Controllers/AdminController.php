<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use App\Models\PromptCategory;
use App\Models\PromptSubCategory;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function prompts()
    {
        $prompts = Prompt::with(['category', 'subcategory'])->get();

        // Add virtual field for example image URL
        $prompts->each(function ($prompt) {
            $prompt->example_image_url = $prompt->getExampleImageUrl();
        });

        $categories = PromptCategory::orderBy('name')->get();
        $subcategories = PromptSubCategory::orderBy('name')->get();

        return Inertia::render('admin/Prompts', [
            'prompts' => $prompts,
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function promptCategories()
    {
        $categories = PromptCategory::withCount(['prompts', 'subcategories'])
            ->orderBy('name')
            ->get();

        $subcategories = PromptSubCategory::with('category')
            ->withCount('prompts')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/prompts/Categories', [
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function promptSubCategories()
    {
        $subcategories = PromptSubCategory::with('category')
            ->withCount('prompts')
            ->orderBy('name')
            ->get();

        $categories = PromptCategory::orderBy('name')->get();

        return Inertia::render('admin/prompts/SubCategories', [
            'subcategories' => $subcategories,
            'categories' => $categories,
        ]);
    }
}
