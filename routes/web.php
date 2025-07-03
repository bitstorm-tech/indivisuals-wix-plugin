<?php

use App\Http\Controllers\Admin\MugController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PromptController as AdminPromptController;
use App\Http\Controllers\Admin\PromptTesterController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'index')->name('home');
Route::inertia('/editor', 'editor')->name('editor');
Route::inertia('/cart', 'cart')->name('cart');
Route::inertia('/checkout', 'checkout')->name('checkout');

// Test route for 3D mug preview
Route::inertia('/mug-3d-test', 'mug-3d-test')->name('mug-3d-test');

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
    Route::get('/admin/prompts/new', [AdminPromptController::class, 'create'])->name('admin.prompts.create');
    Route::get('/admin/prompts/{prompt}/edit', [AdminPromptController::class, 'edit'])->name('admin.prompts.edit');
    Route::get('/admin/prompt-categories', [AdminPromptController::class, 'promptCategories'])->name('admin.prompt-categories');

    // Mug management
    Route::get('/admin/mugs', [MugController::class, 'index'])->name('admin.mugs');
    Route::get('/admin/mugs/new', [MugController::class, 'create'])->name('admin.mugs.create');
    Route::get('/admin/mugs/{mug}/edit', [MugController::class, 'edit'])->name('admin.mugs.edit');
    Route::get('/admin/mug-categories', [MugController::class, 'categories'])->name('admin.mug-categories');

    // Order management
    Route::get('/admin/orders/open', [OrderController::class, 'open'])->name('admin.orders.open');
    Route::get('/admin/orders/completed', [OrderController::class, 'completed'])->name('admin.orders.completed');

    // Prompt Tester
    Route::get('/admin/prompt-tester', [PromptTesterController::class, 'index'])->name('admin.prompt-tester');

    Route::redirect('/admin', '/admin/prompts'); // Redirect old route to new location
});

// Test route for React Compiler
if (app()->environment('local')) {
    Route::inertia('/test-compiler', 'test-compiler')->name('test.compiler');
}

// Load API routes with web middleware
require __DIR__.'/api-web.php';
