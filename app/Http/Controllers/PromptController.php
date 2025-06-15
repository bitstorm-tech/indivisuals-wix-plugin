<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use App\Services\ImageConverterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

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

        $prompts = $query->orderBy('category')->orderBy('name')->get();

        // Add virtual field to indicate if prompt has example image
        $prompts->each(function ($prompt) {
            $prompt->has_example_image = $prompt->hasExampleImage();
        });

        return response()->json($prompts);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'prompt' => 'required|string',
            'active' => 'required|boolean',
            'example_image' => 'nullable|image|max:5120', // 5MB max
            'crop_data' => 'nullable|array',
            'crop_data.x' => 'required_with:crop_data|numeric|min:0',
            'crop_data.y' => 'required_with:crop_data|numeric|min:0',
            'crop_data.width' => 'required_with:crop_data|numeric|min:0',
            'crop_data.height' => 'required_with:crop_data|numeric|min:0',
            'crop_data.unit' => 'required_with:crop_data|in:%,px',
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
            $cropData = $validated['crop_data'] ?? null;

            if ($cropData) {
                // Crop and convert to WebP
                $webpData = $this->imageConverter->cropAndResize($file->getRealPath(), $cropData);
            } else {
                // Just convert to WebP without cropping
                $webpData = $this->imageConverter->convertToWebp($file->getRealPath());
            }

            $prompt->setExampleImageFromData($webpData, 'image/webp');
        }

        $prompt->save();
        $prompt->has_example_image = $prompt->hasExampleImage();

        // Return redirect for Inertia requests
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Prompt created successfully.');
        }

        return response()->json($prompt, 201);
    }

    public function show(Prompt $prompt): JsonResponse
    {
        $prompt->has_example_image = $prompt->hasExampleImage();

        return response()->json($prompt);
    }

    public function update(Request $request, Prompt $prompt): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'prompt' => 'sometimes|required|string',
            'active' => 'sometimes|required|boolean',
            'example_image' => 'nullable|image|max:5120', // 5MB max
            'remove_example_image' => 'sometimes|boolean',
            'crop_data' => 'nullable|array',
            'crop_data.x' => 'required_with:crop_data|numeric|min:0',
            'crop_data.y' => 'required_with:crop_data|numeric|min:0',
            'crop_data.width' => 'required_with:crop_data|numeric|min:0',
            'crop_data.height' => 'required_with:crop_data|numeric|min:0',
            'crop_data.unit' => 'required_with:crop_data|in:%,px',
        ]);

        // Convert string boolean to actual boolean only if it's a string (from FormData)
        if (isset($validated['active']) && is_string($validated['active'])) {
            $validated['active'] = filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN);
        }

        // Update other fields (except example_image which is handled separately)
        $dataToUpdate = collect($validated)->except(['example_image', 'remove_example_image', 'crop_data'])->toArray();
        $prompt->fill($dataToUpdate);

        if ($request->boolean('remove_example_image')) {
            $prompt->example_image = null;
            $prompt->example_image_mime_type = null;
        } elseif ($request->hasFile('example_image')) {
            $file = $request->file('example_image');
            $cropData = $validated['crop_data'] ?? null;

            Log::info('Uploading example image', [
                'prompt_id' => $prompt->id,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'has_crop_data' => ! is_null($cropData),
            ]);

            if ($cropData) {
                // Crop and convert to WebP
                $webpData = $this->imageConverter->cropAndResize($file->getRealPath(), $cropData);
            } else {
                // Just convert to WebP without cropping
                $webpData = $this->imageConverter->convertToWebp($file->getRealPath());
            }

            $prompt->setExampleImageFromData($webpData, 'image/webp');
        }

        $prompt->save();

        $prompt->has_example_image = $prompt->hasExampleImage();

        // Return redirect for Inertia requests
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Prompt updated successfully.');
        }

        return response()->json($prompt);
    }

    public function destroy(Prompt $prompt): JsonResponse|RedirectResponse
    {
        $prompt->delete();

        // Return redirect for Inertia requests
        if (request()->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Prompt deleted successfully.');
        }

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

    public function exampleImage(Prompt $prompt): Response
    {
        if (! $prompt->hasExampleImage()) {
            abort(404, 'Prompt has no example image');
        }

        return response($prompt->example_image)
            ->header('Content-Type', $prompt->example_image_mime_type);
    }
}
