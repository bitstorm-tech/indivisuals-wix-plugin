<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MugCategoryController;
use App\Http\Controllers\MugController;
use App\Http\Controllers\MugSubCategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PromptCategoryController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\PromptSubCategoryController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');
Route::inertia('/editor', 'editor')->name('editor');
Route::inertia('/editor-new', 'editor-new')->name('editor-new');

Route::post('/upload-image', [ImageController::class, 'store'])->middleware('auth')->name('image.upload');
Route::get('/images/{filename}', [ImageController::class, 'show'])->name('image.show');
Route::post('/generate-image', [ImageController::class, 'generateImage'])->name('image.generate');

Route::apiResource('prompts', PromptController::class);
Route::apiResource('prompt-categories', PromptCategoryController::class);
Route::apiResource('prompt-sub-categories', PromptSubCategoryController::class);

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Protected admin routes
Route::middleware('auth')->group(function () {
    // Prompt management
    Route::get('/admin/prompts', [AdminController::class, 'prompts'])->name('admin.prompts');
    Route::get('/admin/prompt-categories', [AdminController::class, 'promptCategories'])->name('admin.prompt-categories');

    // Mug management
    Route::get('/admin/mugs', [MugController::class, 'index'])->name('admin.mugs');
    Route::get('/admin/mug-categories', [MugController::class, 'categories'])->name('admin.mug-categories');

    // Mug CRUD routes
    Route::apiResource('mugs', MugController::class)->except(['index', 'show']);
    Route::apiResource('mug-categories', MugCategoryController::class)->except(['index', 'show']);
    Route::apiResource('mug-sub-categories', MugSubCategoryController::class)->except(['index', 'show']);

    // Order management
    Route::get('/admin/orders/open', [OrderController::class, 'open'])->name('admin.orders.open');
    Route::get('/admin/orders/completed', [OrderController::class, 'completed'])->name('admin.orders.completed');

    Route::redirect('/admin', '/admin/prompts'); // Redirect old route to new location
});
