<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

/**
 * @method UploadedFile|null file(string $key)
 * @method array except(array|string $keys)
 * @method string|null header(string $key)
 * @method bool hasFile(string $key)
 * @method array allFiles()
 * @method string method()
 */
class StoreImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:4096', // 4MB max
            ],
            'prompt_id' => 'required|exists:prompts,id',
            'store_images' => 'nullable|in:true,false,1,0',
            'n' => 'nullable|integer|min:1|max:4',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'image.required' => 'No image file was provided.',
            'image.file' => 'The uploaded file is not valid.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, or webp.',
            'image.max' => 'The image size must not exceed 4MB.',
            'prompt_id.required' => 'No prompt was selected.',
            'prompt_id.exists' => 'The selected prompt does not exist.',
            'store_images.in' => 'The store_images parameter must be true or false.',
            'n.integer' => 'The number of images must be an integer.',
            'n.min' => 'At least 1 image must be generated.',
            'n.max' => 'No more than 4 images can be generated at once.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        $fileInfo = 'No file uploaded';
        $debugFileInfo = 'No file uploaded';

        try {
            if ($this->hasFile('image')) {
                /** @var UploadedFile $imageFile */
                $imageFile = $this->file('image');

                if ($imageFile && $imageFile->isValid()) {
                    $fileInfo = [
                        'name' => $imageFile->getClientOriginalName(),
                        'size' => $imageFile->getSize(),
                        'mime' => $imageFile->getMimeType(),
                        'error' => $imageFile->getError(),
                        'error_message' => $imageFile->getErrorMessage(),
                    ];
                    $debugFileInfo = $fileInfo;
                } else {
                    $fileInfo = 'File upload failed or is invalid';
                    $debugFileInfo = [
                        'error' => $imageFile ? $imageFile->getError() : 'Unknown',
                        'error_message' => $imageFile ? $imageFile->getErrorMessage() : 'File object is null',
                    ];
                }
            }
        } catch (\Exception $e) {
            $fileInfo = 'Error accessing file: '.$e->getMessage();
            $debugFileInfo = [
                'error' => 'Exception',
                'message' => $e->getMessage(),
            ];
        }

        // Log validation errors for debugging
        Log::warning('Image upload validation failed', [
            'errors' => $validator->errors()->toArray(),
            'input' => $this->except('image'), // Don't log the actual file
            'file_info' => $fileInfo,
            'all_files' => $this->allFiles(), // Log all uploaded files
            'request_method' => $this->method(),
            'content_type' => $this->header('Content-Type'),
        ]);

        // Additional debugging for file upload issues
        $allFiles = $this->allFiles();
        $filesDebug = [];
        foreach ($allFiles as $key => $file) {
            if ($file instanceof UploadedFile) {
                $filesDebug[$key] = [
                    'is_valid' => $file->isValid(),
                    'error' => $file->getError(),
                    'error_message' => $file->getErrorMessage(),
                    'size' => $file->getSize(),
                    'client_name' => $file->getClientOriginalName(),
                ];
            } else {
                $filesDebug[$key] = 'Not an UploadedFile instance';
            }
        }

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'debug' => config('app.debug') ? [
                    'file_info' => $debugFileInfo,
                    'request_content_type' => $this->header('Content-Type'),
                    'request_method' => $this->method(),
                    'has_file' => $this->hasFile('image'),
                    'all_files' => array_keys($this->allFiles()),
                    'files_debug' => $filesDebug,
                    'php_file_upload_errors' => [
                        'upload_max_filesize' => ini_get('upload_max_filesize'),
                        'post_max_size' => ini_get('post_max_size'),
                        'max_file_uploads' => ini_get('max_file_uploads'),
                    ],
                ] : null,
            ], 422)
        );
    }
}
