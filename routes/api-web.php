<?php

use App\Http\Controllers\Admin\MugController;
use App\Http\Controllers\Admin\PromptTesterController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\PromptController;
use App\Http\Controllers\Api\UserRegistrationController;
use App\Http\Controllers\Api\CsrfTokenController;
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

    // CSRF token refresh route
    Route::get('/csrf-token', CsrfTokenController::class)->name('api.csrf-token');

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

    // Cart API routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('api.cart.index');
        Route::post('/items', [CartController::class, 'store'])->name('api.cart.store');
        Route::put('/items/{itemId}', [CartController::class, 'update'])->name('api.cart.update');
        Route::delete('/items/{itemId}', [CartController::class, 'destroy'])->name('api.cart.destroy');
        Route::post('/clear', [CartController::class, 'clear'])->name('api.cart.clear');
    });

    // Order API routes
    Route::middleware('auth')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('api.orders.index');
        Route::post('/orders', [OrderController::class, 'store'])->name('api.orders.store');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('api.orders.show');
    });

    // PDF generation
    Route::post('/pdf/generate', [PdfController::class, 'generate'])->name('api.pdf.generate');
    Route::get('/pdf/test', [PdfController::class, 'test'])->name('api.pdf.test');

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

    // Public mug routes
    Route::get('/mugs', [MugController::class, 'index'])->name('api.mugs.index');
    Route::get('/mugs/{mug}', [MugController::class, 'show'])->name('api.mugs.show');

    // Protected mug routes
    Route::middleware('auth')->group(function () {
        // Mug CRUD routes (except index and show which are public above)
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
