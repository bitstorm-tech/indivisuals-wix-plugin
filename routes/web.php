<?php

use App\Controller\ImageController;
use App\Http\Controllers\PromptController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');

Route::post('/upload-image', [ImageController::class, 'store'])->name('image.upload');
Route::get('/images/{filename}', [ImageController::class, 'show'])->name('image.show');
Route::post('/generate-image', [ImageController::class, 'generateImage'])->name('image.generate');

Route::apiResource('prompts', PromptController::class);
Route::get('/prompt-categories', [PromptController::class, 'categories'])->name('prompts.categories');
