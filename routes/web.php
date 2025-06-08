<?php

use App\Controller\ImageController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PromptController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');

Route::post('/upload-image', [ImageController::class, 'store'])->name('image.upload');
Route::get('/images/{filename}', [ImageController::class, 'show'])->name('image.show');
Route::post('/generate-image', [ImageController::class, 'generateImage'])->name('image.generate');

Route::apiResource('prompts', PromptController::class);
Route::get('/prompt-categories', [PromptController::class, 'categories'])->name('prompts.categories');

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Protected admin routes
Route::middleware('auth')->group(function () {
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::post('/admin/prompts', [PromptController::class, 'store'])->name('admin.prompts.store');
    Route::put('/admin/prompts/{prompt}', [AdminController::class, 'updatePrompt'])->name('admin.prompts.update');
    Route::delete('/admin/prompts/{prompt}', [AdminController::class, 'deletePrompt'])->name('admin.prompts.delete');
});
