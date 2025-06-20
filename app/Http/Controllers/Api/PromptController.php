<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use App\Models\PromptCategory;
use App\Models\PromptSubCategory;
use App\Services\ImageConverterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PromptController extends Controller
{
    public function __construct(
        private ImageConverterService $imageConverter
    ) {}

    // API methods
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
        // Debug logging
        $file = $request->file('example_image');
        Log::info('Store prompt request', [
            'all_data' => $request->all(),
            'has_file' => $request->hasFile('example_image'),
            'file_present' => $file !== null,
            'file_info' => $file && $file->isValid() ? [
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
                'is_valid' => $file->isValid(),
                'error' => $file->getError(),
                'error_message' => $file->getErrorMessage(),
                'path' => $file->getPathname(),
                'real_path' => $file->getRealPath(),
            ] : ($file ? [
                'is_valid' => false,
                'error' => $file->getError(),
                'error_message' => $file->getErrorMessage(),
                'path' => $file->getPathname(),
            ] : null),
            'files' => $request->files->all(),
            'content_type' => $request->header('Content-Type'),
            'request_method' => $request->method(),
            'is_json' => $request->isJson(),
            'is_multipart' => str_contains($request->header('Content-Type', ''), 'multipart/form-data'),
        ]);

        // Handle subcategory_id being "0" or empty string from frontend
        if ($request->input('subcategory_id') === '0' || $request->input('subcategory_id') === '') {
            $request->merge(['subcategory_id' => null]);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:prompt_categories,id',
                'subcategory_id' => 'nullable|exists:prompt_sub_categories,id',
                'prompt' => 'required|string',
                'active' => 'required|in:0,1,true,false,on,off,yes,no',
                'example_image' => 'nullable|image|max:2048', // 2MB max (PHP upload_max_filesize limit)
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            throw $e;
        }

        // Convert string boolean to actual boolean only if it's a string (from FormData)
        if (isset($validated['active']) && is_string($validated['active'])) {
            $validated['active'] = filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN);
        }

        // Don't pass the file to the constructor
        $promptData = collect($validated)->except('example_image')->toArray();
        $prompt = new Prompt($promptData);

        if ($request->hasFile('example_image') && $validated['example_image']) {
            $file = $validated['example_image'];

            // Ensure the file is valid before processing
            if (! $file->isValid()) {
                Log::error('Invalid file upload', [
                    'error' => $file->getError(),
                    'error_message' => $file->getErrorMessage(),
                ]);
                throw new \Exception('The uploaded file is invalid: '.$file->getErrorMessage());
            }

            try {
                // Just convert to WebP without cropping (images are now cropped on frontend)
                $webpData = $this->imageConverter->convertToWebp($file->getRealPath());

                if (! $webpData) {
                    Log::error('Failed to convert image to WebP');
                    throw new \Exception('Failed to convert image to WebP format');
                }

                // Generate UUID filename
                $filename = Str::uuid().'.webp';

                // Ensure directory exists
                Storage::disk('public')->makeDirectory('example-images');

                // Save to storage
                $saved = Storage::disk('public')->put('example-images/'.$filename, $webpData);

                if (! $saved) {
                    Log::error('Failed to save WebP file to storage', [
                        'filename' => $filename,
                        'data_size' => strlen($webpData),
                    ]);
                    throw new \Exception('Failed to save image to storage');
                }

                // Verify file was saved
                if (! Storage::disk('public')->exists('example-images/'.$filename)) {
                    Log::error('WebP file not found after saving', [
                        'filename' => $filename,
                        'expected_path' => Storage::disk('public')->path('example-images/'.$filename),
                    ]);
                    throw new \Exception('Image file was not saved correctly');
                }

                Log::info('Successfully saved WebP image', [
                    'filename' => $filename,
                    'size' => Storage::disk('public')->size('example-images/'.$filename),
                    'path' => Storage::disk('public')->path('example-images/'.$filename),
                ]);

                // Store filename in database
                $prompt->example_image_filename = $filename;
            } catch (\Exception $e) {
                Log::error('Image processing failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                // Continue without image rather than failing the entire prompt creation
                // You might want to throw the exception instead if image is required
            }
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
            'example_image' => 'nullable|image|max:2048', // 2MB max (PHP upload_max_filesize limit)
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

    // Category methods
    public function indexCategories(): JsonResponse
    {
        $categories = PromptCategory::orderBy('name')->get();

        return response()->json($categories);
    }

    public function storeCategory(Request $request): JsonResponse|RedirectResponse
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

    public function showCategory(PromptCategory $promptCategory): JsonResponse
    {
        return response()->json($promptCategory);
    }

    public function updateCategory(Request $request, PromptCategory $promptCategory): JsonResponse|RedirectResponse
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

    public function destroyCategory(PromptCategory $promptCategory): JsonResponse|RedirectResponse
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

    // SubCategory methods
    public function indexSubCategories(): JsonResponse
    {
        $subCategories = PromptSubCategory::orderBy('name')->get();

        return response()->json($subCategories);
    }

    public function storeSubCategory(Request $request): JsonResponse|RedirectResponse
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

    public function showSubCategory(PromptSubCategory $promptSubCategory): JsonResponse
    {
        return response()->json($promptSubCategory);
    }

    public function updateSubCategory(Request $request, PromptSubCategory $promptSubCategory): JsonResponse|RedirectResponse
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

    public function destroySubCategory(PromptSubCategory $promptSubCategory): JsonResponse|RedirectResponse
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
