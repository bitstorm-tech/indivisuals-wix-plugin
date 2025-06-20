<?php

use App\Controller\ImageController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\PromptCategoryController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');
Route::inertia('/editor', 'editor')->name('editor');
Route::inertia('/editor-new', 'editor-new')->name('editor-new');

Route::post('/upload-image', [ImageController::class, 'store'])->middleware('auth')->name('image.upload');
Route::get('/images/{filename}', [ImageController::class, 'show'])->name('image.show');
Route::post('/generate-image', [ImageController::class, 'generateImage'])->name('image.generate');

Route::apiResource('prompts', PromptController::class);
Route::get('/prompt-categories', [PromptController::class, 'categories'])->name('prompts.categories');
Route::apiResource('prompt-categories', PromptCategoryController::class);

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Protected admin routes
Route::middleware('auth')->group(function () {
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');
});
