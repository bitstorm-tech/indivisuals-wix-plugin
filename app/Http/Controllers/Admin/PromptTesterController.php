<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\OpenAiService;
use Illuminate\Http\Request;
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
            'background' => 'required|in:auto,transparent,opaque',
            'quality' => 'required|in:low,medium,high',
            'size' => 'required|string',
            'image' => 'nullable|image|max:10240', // 10MB max
        ]);

        try {
            // Handle image upload if present (for gpt-image-1)
            $imageSource = null;
            if ($request->hasFile('image')) {
                $imageSource = $request->file('image');
            } elseif ($validated['model'] === 'gpt-image-1') {
                return response()->json(['message' => 'Image is required for gpt-image-1 model'], 422);
            }

            // Generate image using the service with masterPrompt override
            $result = $this->openAiService->generateImageWithParams(
                $imageSource,
                $validated['specificPrompt'],
                $validated['model'],
                $validated['quality'],
                $validated['background'],
                $validated['size'],
                1,
                $validated['masterPrompt']
            );

            // Return the image as a base64 data URL (no filesystem storage)
            return response()->json([
                'imageUrl' => 'data:image/png;base64,'.$result['images'],
                'requestParams' => $result['requestParams'],
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
