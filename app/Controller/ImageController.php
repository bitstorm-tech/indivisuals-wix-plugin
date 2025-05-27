<?php

namespace App\Controller;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use OpenAI\Laravel\Facades\OpenAI;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImageController
{
    private $systemPrompt = '';

    public function store(Request $request): JsonResponse
    {
        // Validate the uploaded file
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Max 2MB
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

            // Generate a unique filename
            $filename = Str::uuid().'.'.$image->getClientOriginalExtension();

            // Store the image in the local disk under 'images' directory
            // This makes it private by default
            $path = $image->storeAs('images', $filename, 'local');

            // Call the image generation method
            $generationResult = $this->processAndGenerateImage($path);

            if ($generationResult['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Image uploaded and generated successfully',
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Image uploaded but failed to generate variation: '.$generationResult['message'],
                    'error' => $generationResult['error'],
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

        $path = 'images/'.$filename;

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

    /**
     * Process an uploaded image and generate a variation using OpenAI API.
     *
     * @param  string  $imagePath  The path to the already stored image file.
     * @return array An array containing the success status, message, and data or error details.
     */
    private function processAndGenerateImage(string $imagePath): array
    {
        try {
            $fullPath = Storage::disk('local')->path($imagePath);

            $response = OpenAI::images()->variation([
                'image' => fopen($fullPath, 'r'), // Pass the file resource
                'prompt' => $this->systemPrompt, // Prompt is optional for variations but included as per request
                'n' => 1, // Number of images to generate
                'size' => '1024x1024', // Size of the generated image
            ]);

            $generatedImageUrl = $response->data[0]->url;

            // Download the generated image
            $imageContent = Http::get($generatedImageUrl)->body();

            // Generate a unique filename for the generated image
            $filename = Str::uuid().'.png'; // OpenAI usually returns PNG for generated images

            // Store the generated image in the 'generated' private directory
            Storage::disk('local')->put('generated/'.$filename, $imageContent);

            return [
                'success' => true,
                'message' => 'Image generated and stored successfully',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to generate image: '.$e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }
}
