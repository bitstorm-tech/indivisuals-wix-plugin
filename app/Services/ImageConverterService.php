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
}
