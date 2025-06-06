<?php

namespace App\Controller;

use App\Services\OpenAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImageController
{
    private $systemPrompt = 'Change the image to a pencil sketch';
    
    public function __construct(private OpenAiService $openAiService)
    {
    }

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
            $fullPath = Storage::disk('local')->path($path);
            $imageUrls = $this->openAiService->generateImage($fullPath, $this->systemPrompt);
            
            if (!empty($imageUrls)) {
                // Download and store the generated image
                $imageContent = Http::get($imageUrls[0])->body();
                $filename = Str::uuid().'.png';
                Storage::disk('local')->put('generated/'.$filename, $imageContent);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Image uploaded and generated successfully',
                ], 200);
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

}
