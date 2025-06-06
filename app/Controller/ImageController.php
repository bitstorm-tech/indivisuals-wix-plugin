<?php

namespace App\Controller;

use App\Services\OpenAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImageController
{
    private $systemPrompt = 'Change the image to a pencil sketch';

    public function __construct(private OpenAiService $openAiService) {}

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

            // Convert to PNG if needed for OpenAI API
            $pngPath = $this->convertToPng($path);

            // Call the image generation method
            $fullPath = Storage::disk('local')->path($pngPath);
            $base64Json = $this->openAiService->generateImage($fullPath, $this->systemPrompt);

            if (! empty($base64Json)) {
                // Decode the base64 image data and store to disk
                $imageContent = base64_decode($base64Json);

                if ($imageContent === false) {
                    throw new \Exception('Failed to decode base64 image data');
                }

                $generatedFilename = Str::uuid().'.png';
                Storage::disk('local')->put('generated/'.$generatedFilename, $imageContent);

                return response()->json([
                    'success' => true,
                    'message' => 'Image uploaded and generated successfully',
                    'generated_filename' => $generatedFilename,
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

    /**
     * Convert an image to PNG format if it's not already PNG.
     *
     * @param  string  $imagePath  The path to the stored image file
     * @return string The path to the PNG image (original if already PNG, converted if not)
     */
    private function convertToPng(string $imagePath): string
    {
        $fullPath = Storage::disk('local')->path($imagePath);
        $imageInfo = getimagesize($fullPath);

        if (! $imageInfo) {
            throw new \Exception('Invalid image file');
        }

        // If already PNG, return the original path
        if ($imageInfo[2] === IMAGETYPE_PNG) {
            return $imagePath;
        }

        // Create image resource based on original format
        $image = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($fullPath),
            IMAGETYPE_GIF => imagecreatefromgif($fullPath),
            IMAGETYPE_WEBP => imagecreatefromwebp($fullPath),
            default => throw new \Exception('Unsupported image format')
        };

        if (! $image) {
            throw new \Exception('Failed to create image resource');
        }

        // Generate new PNG filename
        $pngFilename = Str::uuid().'.png';
        $pngPath = 'images/'.$pngFilename;
        $pngFullPath = Storage::disk('local')->path($pngPath);

        // Ensure directory exists
        $directory = dirname($pngFullPath);
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        // Save as PNG
        if (! imagepng($image, $pngFullPath)) {
            imagedestroy($image);
            throw new \Exception('Failed to convert image to PNG');
        }

        // Clean up memory
        imagedestroy($image);

        return $pngPath;
    }
}
