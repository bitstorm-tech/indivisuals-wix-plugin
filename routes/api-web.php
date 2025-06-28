<?php

use App\Http\Controllers\Admin\MugController;
use App\Http\Controllers\Admin\PromptTesterController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PromptController;
use App\Http\Controllers\Api\UserRegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Web Routes
|--------------------------------------------------------------------------
|
| These routes are API-style routes that use session authentication.
| They are loaded with the web middleware group to support session auth
| while maintaining REST-style endpoints.
|
*/

Route::prefix('api')->group(function () {
    // Debug route (only in development)
    if (app()->environment('local')) {
        Route::get('/debug/upload-info', [\App\Http\Controllers\Api\DebugController::class, 'uploadInfo']);
    }

    // User registration
    Route::post('/register-or-login', [UserRegistrationController::class, 'registerOrLogin'])->name('api.register-or-login');
    Route::get('/auth/check', [UserRegistrationController::class, 'check'])->name('api.auth.check');

    // Image handling routes
    Route::middleware('auth')->group(function () {
        Route::post('/upload-image', [ImageController::class, 'store'])->name('image.upload');
        Route::post('/generate-image', [ImageController::class, 'generateImage'])->name('image.generate');
    });
    Route::get('/images/{filename}', [ImageController::class, 'show'])->name('image.show');

    // Prompts API
    Route::apiResource('prompts', PromptController::class);

    // Prompt categories
    Route::prefix('prompt-categories')->group(function () {
        Route::get('/', [PromptController::class, 'indexCategories']);
        Route::post('/', [PromptController::class, 'storeCategory']);
        Route::get('/{promptCategory}', [PromptController::class, 'showCategory']);
        Route::put('/{promptCategory}', [PromptController::class, 'updateCategory']);
        Route::patch('/{promptCategory}', [PromptController::class, 'updateCategory']);
        Route::delete('/{promptCategory}', [PromptController::class, 'destroyCategory']);
    });

    // Prompt sub-categories
    Route::prefix('prompt-sub-categories')->group(function () {
        Route::get('/', [PromptController::class, 'indexSubCategories']);
        Route::post('/', [PromptController::class, 'storeSubCategory']);
        Route::get('/{promptSubCategory}', [PromptController::class, 'showSubCategory']);
        Route::put('/{promptSubCategory}', [PromptController::class, 'updateSubCategory']);
        Route::patch('/{promptSubCategory}', [PromptController::class, 'updateSubCategory']);
        Route::delete('/{promptSubCategory}', [PromptController::class, 'destroySubCategory']);
    });

    // Protected mug routes
    Route::middleware('auth')->group(function () {
        // Mug CRUD routes (except index and show which might be public)
        Route::apiResource('mugs', MugController::class)->except(['index', 'show']);

        // Mug categories
        Route::prefix('mug-categories')->group(function () {
            Route::post('/', [MugController::class, 'storeCategory']);
            Route::put('/{mugCategory}', [MugController::class, 'updateCategory']);
            Route::patch('/{mugCategory}', [MugController::class, 'updateCategory']);
            Route::delete('/{mugCategory}', [MugController::class, 'destroyCategory']);
        });

        // Mug sub-categories
        Route::prefix('mug-sub-categories')->group(function () {
            Route::post('/', [MugController::class, 'storeSubCategory']);
            Route::put('/{mugSubCategory}', [MugController::class, 'updateSubCategory']);
            Route::patch('/{mugSubCategory}', [MugController::class, 'updateSubCategory']);
            Route::delete('/{mugSubCategory}', [MugController::class, 'destroySubCategory']);
        });

        // Admin test prompt
        Route::post('/admin/test-prompt', [PromptTesterController::class, 'testPrompt'])->name('admin.test-prompt');
    });
});
