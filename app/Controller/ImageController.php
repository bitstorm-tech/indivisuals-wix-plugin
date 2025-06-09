<?php

namespace App\Controller;

use App\Models\Prompt;
use App\Services\ImageConverterService;
use App\Services\OpenAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImageController
{
    public function __construct(
        private OpenAiService $openAiService,
        private ImageConverterService $imageConverter
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'prompt_id' => 'required|exists:prompts,id',
            'store_images' => 'nullable|in:true,false,1,0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $image = $request->file('image');
            $storeImages = $request->boolean('store_images', true);

            if ($storeImages) {
                $filename = Str::uuid().'.'.$image->getClientOriginalExtension();
                $path = $image->storeAs('images', $filename, 'local');
                $pngPath = $this->imageConverter->convertToPng(Storage::disk('local')->path($path), true, $path);
                $fullPath = Storage::disk('local')->path($pngPath);
            } else {
                $tempPath = $image->getPathName();
                $fullPath = $this->imageConverter->convertToPng($tempPath, false);
            }

            $prompt = Prompt::whereActive(true)->find($request->prompt_id)?->prompt;

            $base64Json = $this->openAiService->generateImage($fullPath, $prompt);

            if (! empty($base64Json)) {
                $imageContent = base64_decode($base64Json);

                if ($imageContent === false) {
                    throw new \Exception('Failed to decode base64 image data');
                }

                $responseData = [
                    'success' => true,
                    'message' => 'Image uploaded and generated successfully',
                    'generated_image_url' => 'data:image/png;base64,'.base64_encode($imageContent),
                ];

                if ($storeImages) {
                    Storage::disk('local')->put("generated/$filename.png", $imageContent);
                    $responseData['generated_image_path'] = "generated/$filename.png";
                }

                return response()->json($responseData, 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Image uploaded but failed to generate variation',
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload or process image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Serve a private image securely.
     */
    public function show(string $filename): StreamedResponse
    {
        // You would add authorization logic here
        // For example: if (!auth()->user()->canAccessImage($filename)) { abort(403); }

        // Check if it's a generated image first
        $path = 'generated/'.$filename;
        if (! Storage::disk('local')->exists($path)) {
            // Fall back to original images folder
            $path = 'images/'.$filename;
        }

        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $file = Storage::disk('local')->get($path);
        $type = Storage::mimeType($path);

        return response()->stream(function () use ($file) {
            echo $file;
        }, 200, [
            'Content-Type' => $type,
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

}
