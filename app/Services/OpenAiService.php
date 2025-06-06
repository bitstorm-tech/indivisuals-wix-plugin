<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class OpenAiService
{
    private Client $httpClient;

    private string $apiKey;

    private string $baseUrl = 'https://api.openai.com/v1/images/edits';

    public function __construct(Client $httpClient)
    {
        $this->httpClient = $httpClient;
        $this->apiKey = env('OPENAI_API_KEY');
    }

    public function generateImage(string $imagePath, string $prompt, int $n = 1, string $size = '1024x1024'): string
    {
        try {
            if (! file_exists($imagePath) || ! is_readable($imagePath)) {
                throw new \InvalidArgumentException("Image file is not accessible: {$imagePath}");
            }

            $response = $this->httpClient->post($this->baseUrl, [
                'headers' => [
                    'Authorization' => 'Bearer '.$this->apiKey,
                    // Guzzle will set Content-Type to multipart/form-data
                ],
                'multipart' => [
                    [
                        'name' => 'image',
                        'contents' => fopen($imagePath, 'r'),
                        'filename' => basename($imagePath),
                    ],
                    [
                        'name' => 'quality',
                        'contents' => 'medium',
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
                ],
            ]);

            $data = json_decode($response->getBody(), true);

            if (isset($data['data'])) {
                Log::info('Data: '.print_r($data['data'][0], true));

                return $data['data'][0]['b64_json'];
            }

            // Handle unexpected response structure
            throw new \Exception('Unexpected API response structure.');
        } catch (RequestException $e) {
            // Log or rethrow a more specific exception
            throw new \Exception('OpenAI API request failed: '.$e->getMessage(), 0, $e);
        } catch (\Exception $e) {
            // General error handling
            throw new \Exception('An error occurred: '.$e->getMessage(), 0, $e);
        }
    }
}
