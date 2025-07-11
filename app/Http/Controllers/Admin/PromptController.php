<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use App\Models\PromptCategory;
use App\Models\PromptSubCategory;
use Inertia\Inertia;

class PromptController extends Controller
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

        return Inertia::render('admin/prompts', [
            'prompts' => $prompts,
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function create()
    {
        $categories = PromptCategory::orderBy('name')->get();
        $subcategories = PromptSubCategory::orderBy('name')->get();

        return Inertia::render('admin/prompt-form', [
            'prompt' => null,
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function edit(Prompt $prompt)
    {
        $prompt->load(['category', 'subcategory']);
        $prompt->example_image_url = $prompt->getExampleImageUrl();

        $categories = PromptCategory::orderBy('name')->get();
        $subcategories = PromptSubCategory::orderBy('name')->get();

        return Inertia::render('admin/prompt-form', [
            'prompt' => $prompt,
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

        return Inertia::render('admin/prompt-categories', [
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }
}
