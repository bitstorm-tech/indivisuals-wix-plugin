<?php

use App\Controller\ImageController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');

Route::post('/upload-image', [ImageController::class, 'store'])->name('image.upload');
