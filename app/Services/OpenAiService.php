<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

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

    public function generateImage(string $imagePath, string $prompt, int $n = 1, string $size = '1024x1024'): array
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
                        'name' => 'prompt',
                        'contents' => $prompt,
                    ],
                    [
                        'name' => 'n',
                        'contents' => $n,
                    ],
                    [
                        'name' => 'size',
                        'contents' => $size,
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['data'])) {
                return array_column($data['data'], 'url');
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
