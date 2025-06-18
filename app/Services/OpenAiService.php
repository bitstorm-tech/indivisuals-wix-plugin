<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class OpenAiService
{
    private Client $httpClient;

    private string $systemPrompt = 'Prioritize subject fidelity in stylizations. Preserve facial identity (proportions, features, expression, skin tone) in portraits. For groups, maintain exact count, positions, and faces. For animals: pose, proportions, fur, eyes. For vehicles: shape, logo, angle. For buildings: windows, roof, layout. For landscapes: terrain, horizon, structure. Apply style as soft overlay only (Level 1–3), never distort form. Backgrounds may be fully stylized but remain secondary. Output must always be clearly recognizable. Target: mug prints.';

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

            $prompt = "{$this->systemPrompt} {$prompt}";
            Log::debug('Prompt: '.$prompt);

            $response = $this->httpClient->post($this->baseUrl, [
                'headers' => [
                    'Authorization' => 'Bearer '.$this->apiKey,
                ],
                'multipart' => [
                    [
                        'name' => 'image',
                        'contents' => fopen($imagePath, 'r'),
                        'filename' => basename($imagePath),
                    ],
                    [
                        'name' => 'quality',
                        'contents' => 'low',
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
                return $data['data'][0]['b64_json'];
            }

            throw new \Exception('Unexpected API response structure.');
        } catch (RequestException $e) {
            throw new \Exception('OpenAI API request failed: '.$e->getMessage(), 0, $e);
        } catch (\Exception $e) {
            throw new \Exception('An error occurred: '.$e->getMessage(), 0, $e);
        }
    }
}
