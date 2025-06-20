<?php

use App\Http\Controllers\Admin\MugController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PromptController as AdminPromptController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PromptController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');
Route::inertia('/editor', 'editor')->name('editor');
Route::inertia('/editor-new', 'editor-new')->name('editor-new');

Route::post('/upload-image', [ImageController::class, 'store'])->middleware('auth')->name('image.upload');
Route::get('/images/{filename}', [ImageController::class, 'show'])->name('image.show');
Route::post('/generate-image', [ImageController::class, 'generateImage'])->name('image.generate');

Route::apiResource('prompts', PromptController::class);

// Prompt categories
Route::get('prompt-categories', [PromptController::class, 'indexCategories']);
Route::post('prompt-categories', [PromptController::class, 'storeCategory']);
Route::get('prompt-categories/{promptCategory}', [PromptController::class, 'showCategory']);
Route::put('prompt-categories/{promptCategory}', [PromptController::class, 'updateCategory']);
Route::patch('prompt-categories/{promptCategory}', [PromptController::class, 'updateCategory']);
Route::delete('prompt-categories/{promptCategory}', [PromptController::class, 'destroyCategory']);

// Prompt sub-categories
Route::get('prompt-sub-categories', [PromptController::class, 'indexSubCategories']);
Route::post('prompt-sub-categories', [PromptController::class, 'storeSubCategory']);
Route::get('prompt-sub-categories/{promptSubCategory}', [PromptController::class, 'showSubCategory']);
Route::put('prompt-sub-categories/{promptSubCategory}', [PromptController::class, 'updateSubCategory']);
Route::patch('prompt-sub-categories/{promptSubCategory}', [PromptController::class, 'updateSubCategory']);
Route::delete('prompt-sub-categories/{promptSubCategory}', [PromptController::class, 'destroySubCategory']);

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Protected admin routes
Route::middleware('auth')->group(function () {
    // Prompt management
    Route::get('/admin/prompts', [AdminPromptController::class, 'prompts'])->name('admin.prompts');
    Route::get('/admin/prompt-categories', [AdminPromptController::class, 'promptCategories'])->name('admin.prompt-categories');

    // Mug management
    Route::get('/admin/mugs', [MugController::class, 'index'])->name('admin.mugs');
    Route::get('/admin/mug-categories', [MugController::class, 'categories'])->name('admin.mug-categories');

    // Mug CRUD routes
    Route::apiResource('mugs', MugController::class)->except(['index', 'show']);

    // Mug categories
    Route::post('mug-categories', [MugController::class, 'storeCategory']);
    Route::put('mug-categories/{mugCategory}', [MugController::class, 'updateCategory']);
    Route::patch('mug-categories/{mugCategory}', [MugController::class, 'updateCategory']);
    Route::delete('mug-categories/{mugCategory}', [MugController::class, 'destroyCategory']);

    // Mug sub-categories
    Route::post('mug-sub-categories', [MugController::class, 'storeSubCategory']);
    Route::put('mug-sub-categories/{mugSubCategory}', [MugController::class, 'updateSubCategory']);
    Route::patch('mug-sub-categories/{mugSubCategory}', [MugController::class, 'updateSubCategory']);
    Route::delete('mug-sub-categories/{mugSubCategory}', [MugController::class, 'destroySubCategory']);

    // Order management
    Route::get('/admin/orders/open', [OrderController::class, 'open'])->name('admin.orders.open');
    Route::get('/admin/orders/completed', [OrderController::class, 'completed'])->name('admin.orders.completed');

    Route::redirect('/admin', '/admin/prompts'); // Redirect old route to new location
});
