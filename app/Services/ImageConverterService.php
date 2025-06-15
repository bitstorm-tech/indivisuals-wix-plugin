<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class ImageConverterService
{
    /**
     * Convert an image to PNG format with optional storage.
     *
     * @param  string  $sourceImagePath  The path to the source image file
     * @param  bool  $store  Whether to store the converted image permanently
     * @param  string|null  $storagePath  The storage path for permanent storage (required if $store is true)
     * @return string The path to the PNG image
     */
    public function convertToPng(string $sourceImagePath, bool $store = false, ?string $storagePath = null): string
    {
        $imageInfo = getimagesize($sourceImagePath);

        if (! $imageInfo) {
            throw new \Exception('Invalid image file');
        }

        if ($imageInfo[2] === IMAGETYPE_PNG) {
            return $store ? $storagePath : $sourceImagePath;
        }

        $image = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($sourceImagePath),
            IMAGETYPE_GIF => imagecreatefromgif($sourceImagePath),
            IMAGETYPE_WEBP => imagecreatefromwebp($sourceImagePath),
            default => throw new \Exception('Unsupported image format')
        };

        if (! $image) {
            throw new \Exception('Failed to create image resource');
        }

        if ($store) {
            return $this->savePermanently($image, $storagePath);
        } else {
            return $this->saveTemporarily($image);
        }
    }

    /**
     * Save the image resource permanently to storage.
     *
     * @param  resource|\GDImage  $image  The image resource
     * @param  string|null  $storagePath  The storage path
     * @return string The path to the saved PNG image
     */
    private function savePermanently($image, ?string $storagePath): string
    {
        if (! $storagePath) {
            imagedestroy($image);
            throw new \Exception('Storage path is required when storing converted image');
        }

        $originalFilename = pathinfo($storagePath, PATHINFO_FILENAME);
        $pngFilename = $originalFilename.'.png';
        $pngPath = 'images/'.$pngFilename;
        $pngFullPath = Storage::disk('local')->path($pngPath);

        $directory = dirname($pngFullPath);
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if (! imagepng($image, $pngFullPath)) {
            imagedestroy($image);
            throw new \Exception('Failed to convert image to PNG');
        }

        imagedestroy($image);

        return $pngPath;
    }

    /**
     * Save the image resource temporarily.
     *
     * @param  resource|\GDImage  $image  The image resource
     * @return string The path to the temporary PNG image
     */
    private function saveTemporarily($image): string
    {
        $tempPngPath = sys_get_temp_dir().'/'.uniqid('img_', true).'.png';

        if (! imagepng($image, $tempPngPath)) {
            imagedestroy($image);
            throw new \Exception('Failed to convert image to PNG');
        }

        imagedestroy($image);

        return $tempPngPath;
    }

    /**
     * Convert an image to WebP format.
     *
     * @param  string  $sourceImagePath  The path to the source image file
     * @param  int  $quality  The quality of the WebP image (0-100)
     * @return string The WebP image data as a string
     */
    public function convertToWebp(string $sourceImagePath, int $quality = 85): string
    {
        $imageInfo = getimagesize($sourceImagePath);

        if (! $imageInfo) {
            throw new \Exception('Invalid image file');
        }

        $image = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($sourceImagePath),
            IMAGETYPE_PNG => imagecreatefromstring(file_get_contents($sourceImagePath)),
            IMAGETYPE_GIF => imagecreatefromgif($sourceImagePath),
            IMAGETYPE_WEBP => imagecreatefromwebp($sourceImagePath),
            default => throw new \Exception('Unsupported image format')
        };

        if (! $image) {
            throw new \Exception('Failed to create image resource');
        }

        // Start output buffering to capture WebP data
        ob_start();
        imagewebp($image, null, $quality);
        $webpData = ob_get_clean();

        imagedestroy($image);

        if ($webpData === false) {
            throw new \Exception('Failed to convert image to WebP');
        }

        return $webpData;
    }

    /**
     * Crop and resize an image to fit within 1080p resolution.
     *
     * @param  string  $sourceImagePath  The path to the source image file
     * @param  array  $cropData  The crop data with x, y, width, height
     * @param  int  $quality  The quality of the output image (0-100)
     * @return string The cropped and converted WebP image data as a string
     */
    public function cropAndResize(string $sourceImagePath, array $cropData, int $quality = 85): string
    {
        $imageInfo = getimagesize($sourceImagePath);

        if (! $imageInfo) {
            throw new \Exception('Invalid image file');
        }

        $sourceWidth = $imageInfo[0];
        $sourceHeight = $imageInfo[1];

        // Create image resource from source
        $sourceImage = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($sourceImagePath),
            IMAGETYPE_PNG => imagecreatefromstring(file_get_contents($sourceImagePath)),
            IMAGETYPE_GIF => imagecreatefromgif($sourceImagePath),
            IMAGETYPE_WEBP => imagecreatefromwebp($sourceImagePath),
            default => throw new \Exception('Unsupported image format')
        };

        if (! $sourceImage) {
            throw new \Exception('Failed to create image resource');
        }

        // Calculate crop coordinates based on percentage if unit is '%'
        $cropX = $cropData['unit'] === '%' ? ($cropData['x'] / 100) * $sourceWidth : $cropData['x'];
        $cropY = $cropData['unit'] === '%' ? ($cropData['y'] / 100) * $sourceHeight : $cropData['y'];
        $cropWidth = $cropData['unit'] === '%' ? ($cropData['width'] / 100) * $sourceWidth : $cropData['width'];
        $cropHeight = $cropData['unit'] === '%' ? ($cropData['height'] / 100) * $sourceHeight : $cropData['height'];

        // Ensure crop dimensions are within bounds
        $cropX = max(0, min($cropX, $sourceWidth - 1));
        $cropY = max(0, min($cropY, $sourceHeight - 1));
        $cropWidth = min($cropWidth, $sourceWidth - $cropX);
        $cropHeight = min($cropHeight, $sourceHeight - $cropY);

        // Calculate target dimensions to fit within 1080p (1920x1080)
        $maxWidth = 1920;
        $maxHeight = 1080;

        // Calculate aspect ratio of cropped area
        $aspectRatio = $cropWidth / $cropHeight;

        // Determine target dimensions
        if ($cropWidth > $maxWidth || $cropHeight > $maxHeight) {
            if ($aspectRatio > ($maxWidth / $maxHeight)) {
                // Width is the limiting factor
                $targetWidth = $maxWidth;
                $targetHeight = (int) ($maxWidth / $aspectRatio);
            } else {
                // Height is the limiting factor
                $targetHeight = $maxHeight;
                $targetWidth = (int) ($maxHeight * $aspectRatio);
            }
        } else {
            // Crop is already smaller than 1080p, keep original crop size
            $targetWidth = (int) $cropWidth;
            $targetHeight = (int) $cropHeight;
        }

        // Create target image
        $targetImage = imagecreatetruecolor($targetWidth, $targetHeight);

        // Preserve transparency for PNG images
        if ($imageInfo[2] === IMAGETYPE_PNG) {
            imagealphablending($targetImage, false);
            imagesavealpha($targetImage, true);
            $transparent = imagecolorallocatealpha($targetImage, 255, 255, 255, 127);
            imagefilledrectangle($targetImage, 0, 0, $targetWidth, $targetHeight, $transparent);
        }

        // Copy and resize the cropped portion
        imagecopyresampled(
            $targetImage,
            $sourceImage,
            0,
            0,
            (int) $cropX,
            (int) $cropY,
            $targetWidth,
            $targetHeight,
            (int) $cropWidth,
            (int) $cropHeight
        );

        // Convert to WebP
        ob_start();
        imagewebp($targetImage, null, $quality);
        $webpData = ob_get_clean();

        imagedestroy($sourceImage);
        imagedestroy($targetImage);

        if ($webpData === false) {
            throw new \Exception('Failed to convert image to WebP');
        }

        return $webpData;
    }
}
