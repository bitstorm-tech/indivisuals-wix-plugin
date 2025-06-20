<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use App\Services\ImageConverterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PromptController extends Controller
{
    public function __construct(
        private ImageConverterService $imageConverter
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Prompt::query();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $prompts = $query->orderBy('category_id')->orderBy('name')->get();

        // Add virtual field
        $prompts->each(function ($prompt) {
            $prompt->example_image_url = $prompt->getExampleImageUrl();
        });

        return response()->json($prompts);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:prompt_categories,id',
            'subcategory_id' => 'nullable|exists:prompt_sub_categories,id',
            'prompt' => 'required|string',
            'active' => 'required|boolean',
            'example_image' => 'nullable|image|max:5120', // 5MB max
        ]);

        // Convert string boolean to actual boolean only if it's a string (from FormData)
        if (isset($validated['active']) && is_string($validated['active'])) {
            $validated['active'] = filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN);
        }

        // Don't pass the file to the constructor
        $promptData = collect($validated)->except('example_image')->toArray();
        $prompt = new Prompt($promptData);

        if ($request->hasFile('example_image')) {
            $file = $request->file('example_image');

            // Just convert to WebP without cropping (images are now cropped on frontend)
            $webpData = $this->imageConverter->convertToWebp($file->getRealPath());

            // Generate UUID filename
            $filename = Str::uuid().'.webp';

            // Ensure directory exists
            Storage::disk('public')->makeDirectory('example-images');

            // Save to storage
            Storage::disk('public')->put('example-images/'.$filename, $webpData);

            // Store filename in database
            $prompt->example_image_filename = $filename;
        }

        $prompt->save();
        $prompt->example_image_url = $prompt->getExampleImageUrl();

        // Return redirect for Inertia requests
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Prompt created successfully.');
        }

        return response()->json($prompt, 201);
    }

    public function show(Prompt $prompt): JsonResponse
    {
        $prompt->example_image_url = $prompt->getExampleImageUrl();

        return response()->json($prompt);
    }

    public function update(Request $request, Prompt $prompt): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:prompt_categories,id',
            'subcategory_id' => 'nullable|exists:prompt_sub_categories,id',
            'prompt' => 'sometimes|required|string',
            'active' => 'sometimes|required|boolean',
            'example_image' => 'nullable|image|max:5120', // 5MB max
            'remove_example_image' => 'sometimes|boolean',
        ]);

        // Convert string boolean to actual boolean only if it's a string (from FormData)
        if (isset($validated['active']) && is_string($validated['active'])) {
            $validated['active'] = filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN);
        }

        // Update other fields (except example_image which is handled separately)
        $dataToUpdate = collect($validated)->except(['example_image', 'remove_example_image'])->toArray();
        $prompt->fill($dataToUpdate);

        if ($request->boolean('remove_example_image')) {
            // Delete existing file if any
            $prompt->deleteExampleImageFile();
            $prompt->example_image_filename = null;
        } elseif ($request->hasFile('example_image')) {
            $file = $request->file('example_image');

            Log::info('Uploading example image', [
                'prompt_id' => $prompt->id,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            // Just convert to WebP without cropping (images are now cropped on frontend)
            $webpData = $this->imageConverter->convertToWebp($file->getRealPath());

            // Delete old file if exists
            $prompt->deleteExampleImageFile();

            // Generate UUID filename
            $filename = Str::uuid().'.webp';

            // Ensure directory exists
            Storage::disk('public')->makeDirectory('example-images');

            // Save to storage
            Storage::disk('public')->put('example-images/'.$filename, $webpData);

            // Store filename in database
            $prompt->example_image_filename = $filename;
        }

        $prompt->save();

        $prompt->example_image_url = $prompt->getExampleImageUrl();

        // Return redirect for Inertia requests
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Prompt updated successfully.');
        }

        return response()->json($prompt);
    }

    public function destroy(Prompt $prompt): JsonResponse|RedirectResponse
    {
        // Delete associated image file
        $prompt->deleteExampleImageFile();

        $prompt->delete();

        // Return redirect for Inertia requests
        if (request()->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Prompt deleted successfully.');
        }

        return response()->json(null, 204);
    }
}
