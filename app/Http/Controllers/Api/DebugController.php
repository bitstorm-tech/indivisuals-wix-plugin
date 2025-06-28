<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DebugController extends Controller
{
    public function uploadInfo(): JsonResponse
    {
        return response()->json([
            'php_config' => [
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'max_file_uploads' => ini_get('max_file_uploads'),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
            ],
            'laravel_config' => [
                'max_upload_size' => '4MB (4096KB)',
                'allowed_mimes' => ['jpeg', 'png', 'jpg', 'gif', 'webp'],
                'storage_path' => storage_path('app/private/images'),
                'storage_writable' => is_writable(storage_path('app/private/images')),
            ],
            'server_info' => [
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
            ],
        ]);
    }
}
