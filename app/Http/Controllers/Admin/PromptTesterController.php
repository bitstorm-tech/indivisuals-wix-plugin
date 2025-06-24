<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\OpenAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PromptTesterController extends Controller
{
    private OpenAiService $openAiService;

    public function __construct(OpenAiService $openAiService)
    {
        $this->openAiService = $openAiService;
    }

    public function index()
    {
        return Inertia::render('admin/prompt-tester');
    }

    public function testPrompt(Request $request)
    {
        // Increase execution time limit for this request
        set_time_limit(300); // 5 minutes

        $validated = $request->validate([
            'masterPrompt' => 'required|string',
            'specificPrompt' => 'required|string',
            'model' => 'required|in:dall-e-2,gpt-image-1',
            'background' => 'required|in:default,transparent,opaque',
            'quality' => 'required|in:low,medium,high',
            'size' => 'required|string',
            'image' => 'nullable|image|max:10240', // 10MB max
        ]);

        try {
            // Prepare the combined prompt
            $combinedPrompt = $validated['masterPrompt'].' '.$validated['specificPrompt'];

            // Handle image upload if present (for gpt-image-1)
            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = Str::uuid().'.png';

                // Store original image
                $path = $image->storeAs('images', $filename, 'private');
                $imagePath = Storage::disk('private')->path($path);

                // Convert to PNG if needed
                $imageResource = imagecreatefromstring(file_get_contents($imagePath));
                imagepng($imageResource, $imagePath);
                imagedestroy($imageResource);
            } elseif ($validated['model'] === 'gpt-image-1') {
                return response()->json(['message' => 'Image is required for gpt-image-1 model'], 422);
            }

            // Generate image using the service
            $generatedImageData = $this->openAiService->generateImageWithParams(
                $imagePath,
                $combinedPrompt,
                $validated['model'],
                $validated['quality'],
                $validated['background'],
                $validated['size']
            );

            // Save generated image
            $generatedFilename = Str::uuid().'.png';
            $generatedPath = Storage::disk('private')->put(
                'generated/'.$generatedFilename,
                base64_decode($generatedImageData)
            );

            // Clean up original image if it was uploaded
            if ($imagePath && file_exists($imagePath)) {
                unlink($imagePath);
            }

            return response()->json([
                'imageUrl' => route('image.show', ['filename' => 'generated/'.$generatedFilename]),
            ]);

        } catch (\Exception $e) {
            // Check if it's a timeout error
            if (strpos($e->getMessage(), 'cURL error 28') !== false ||
                strpos($e->getMessage(), 'Operation timed out') !== false) {
                return response()->json([
                    'message' => 'The image generation request timed out. This can happen with complex prompts or high quality settings. Please try again with simpler settings.',
                ], 504);
            }

            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
