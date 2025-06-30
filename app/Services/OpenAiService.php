<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class OpenAiService
{
    private Client $httpClient;

    private string $masterPrompt = 'Prioritize subject fidelity in stylizations. Preserve facial identity (proportions, features, expression, skin tone) in portraits. For groups, maintain exact count, positions, and faces. For animals: pose, proportions, fur, eyes. For vehicles: shape, logo, angle. For buildings: windows, roof, layout. For landscapes: terrain, horizon, structure. Apply style as soft overlay only (Level 1–3), never distort form. Backgrounds may be fully stylized but remain secondary. Output must always be clearly recognizable. Target: mug prints.';

    private string $apiKey;

    private string $baseUrl = 'https://api.openai.com/v1/images/edits';

    public function __construct(Client $httpClient)
    {
        $this->httpClient = $httpClient;
        $this->apiKey = env('OPENAI_API_KEY');
    }

    public function generateImage(string $imagePath, string $prompt, int $n = 1, string $size = '1536x1024'): string|array
    {
        $result = $this->generateImageWithParams($imagePath, $prompt, 'gpt-image-1', 'low', 'auto', $size, $n);

        return $result['images'];
    }

    public function generateImageWithParams(
        string|UploadedFile|null $imageSource,
        string $prompt,
        string $model = 'gpt-image-1',
        string $quality = 'low',
        string $background = 'auto',
        string $size = '1024x1024',
        int $n = 1,
        ?string $overrideMasterPrompt = null
    ): array {
        try {
            $masterPrompt = $overrideMasterPrompt ?? $this->masterPrompt;
            $combinedPrompt = "{$masterPrompt} {$prompt}";
            Log::debug('Prompt: '.$combinedPrompt);

            $requestParams = [
                'model' => $model,
                'size' => $size,
                'n' => $n,
                'response_format' => 'b64_json',
                'masterPrompt' => $masterPrompt,
                'specificPrompt' => $prompt,
                'combinedPrompt' => $combinedPrompt,
            ];

            if ($model === 'dall-e-2') {
                $response = $this->generateWithDallE2($imageSource, $combinedPrompt, $size, $n);
            } else {
                $requestParams['quality'] = $quality;
                $requestParams['background'] = $background;
                $response = $this->generateWithGptImage1($imageSource, $combinedPrompt, $quality, $background, $size, $n);
            }

            $data = json_decode($response->getBody(), true);

            if (isset($data['data'])) {
                $images = $n === 1
                    ? $data['data'][0]['b64_json']
                    : array_map(fn ($item) => $item['b64_json'], $data['data']);

                return [
                    'images' => $images,
                    'requestParams' => $requestParams,
                ];
            }

            throw new \Exception('Unexpected API response structure.');
        } catch (RequestException $e) {
            throw new \Exception('OpenAI API request failed: '.$e->getMessage(), 0, $e);
        } catch (\Exception $e) {
            throw new \Exception('An error occurred: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Generate image using DALL-E 2 model.
     */
    private function generateWithDallE2(
        string|UploadedFile|null $imageSource,
        string $prompt,
        string $size,
        int $n
    ) {
        if (! $imageSource) {
            throw new \InvalidArgumentException('Image file is required for dall-e-2 model');
        }

        // Handle the image source
        if ($imageSource instanceof UploadedFile) {
            // Handle uploaded file
            $imageStream = $this->prepareUploadedFileStream($imageSource);
            $filename = $imageSource->getClientOriginalName();
        } else {
            // Handle file path (existing behavior)
            if (! file_exists($imageSource) || ! is_readable($imageSource)) {
                throw new \InvalidArgumentException('Image file is not accessible');
            }
            $imageStream = fopen($imageSource, 'r');
            $filename = basename($imageSource);
        }

        $multipart = [
            [
                'name' => 'image',
                'contents' => $imageStream,
                'filename' => $filename,
            ],
            [
                'name' => 'prompt',
                'contents' => $prompt,
            ],
            [
                'name' => 'model',
                'contents' => 'dall-e-2',
            ],
            [
                'name' => 'size',
                'contents' => $size,
            ],
            [
                'name' => 'n',
                'contents' => $n,
            ],
            [
                'name' => 'response_format',
                'contents' => 'b64_json',
            ],
        ];

        return $this->httpClient->post($this->baseUrl, [
            'headers' => [
                'Authorization' => 'Bearer '.$this->apiKey,
            ],
            'multipart' => $multipart,
            'timeout' => 600, // 10 minute timeout
        ]);
    }

    /**
     * Generate image using GPT-Image-1 model (image edits).
     */
    private function generateWithGptImage1(
        string|UploadedFile|null $imageSource,
        string $prompt,
        string $quality,
        string $background,
        string $size,
        int $n
    ) {
        if (! $imageSource) {
            throw new \InvalidArgumentException('Image file is required for gpt-image-1 model');
        }

        // Handle the image source
        if ($imageSource instanceof UploadedFile) {
            // Handle uploaded file
            $imageStream = $this->prepareUploadedFileStream($imageSource);
            $filename = $imageSource->getClientOriginalName();
        } else {
            // Handle file path (existing behavior)
            if (! file_exists($imageSource) || ! is_readable($imageSource)) {
                throw new \InvalidArgumentException('Image file is not accessible');
            }
            $imageStream = fopen($imageSource, 'r');
            $filename = basename($imageSource);
        }

        $multipart = [
            [
                'name' => 'image',
                'contents' => $imageStream,
                'filename' => $filename,
            ],
            [
                'name' => 'prompt',
                'contents' => $prompt,
            ],
            [
                'name' => 'model',
                'contents' => 'gpt-image-1',
            ],
            [
                'name' => 'size',
                'contents' => $size,
            ],
            [
                'name' => 'n',
                'contents' => $n,
            ],
            [
                'name' => 'quality',
                'contents' => $quality,
            ],
            [
                'name' => 'background',
                'contents' => $background,
            ],
        ];

        return $this->httpClient->post($this->baseUrl, [
            'headers' => [
                'Authorization' => 'Bearer '.$this->apiKey,
            ],
            'multipart' => $multipart,
            'timeout' => 600, // 10 minute timeout
        ]);
    }

    /**
     * Prepare an uploaded file stream, converting to PNG if necessary.
     */
    private function prepareUploadedFileStream(UploadedFile $file)
    {
        $mimeType = $file->getMimeType();

        // If it's already a PNG, just return the file stream
        if ($mimeType === 'image/png') {
            return fopen($file->getRealPath(), 'r');
        }

        // Convert to PNG in memory and save to temp file
        $tempPath = tempnam(sys_get_temp_dir(), 'openai_img_');

        // Get image info
        $imageInfo = getimagesize($file->getRealPath());
        if (! $imageInfo) {
            throw new \Exception('Invalid image file');
        }

        // Create image resource based on type
        $image = match ($imageInfo[2]) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($file->getRealPath()),
            IMAGETYPE_GIF => imagecreatefromgif($file->getRealPath()),
            IMAGETYPE_WEBP => imagecreatefromwebp($file->getRealPath()),
            default => throw new \Exception('Unsupported image format')
        };

        if (! $image) {
            throw new \Exception('Failed to create image resource');
        }

        // Save as PNG to temp file
        if (! imagepng($image, $tempPath)) {
            imagedestroy($image);
            throw new \Exception('Failed to convert image to PNG');
        }

        imagedestroy($image);

        // Return stream to temp file (will be auto-cleaned by PHP)
        return fopen($tempPath, 'r');
    }
}
