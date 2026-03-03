<?php

use App\Http\Controllers\Vendor\DashboardController;
use App\Http\Controllers\Vendor\ProductController;
use App\Http\Controllers\Vendor\OrderController;
use App\Http\Controllers\Vendor\EarningsController;
use App\Http\Controllers\Vendor\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'vendor', 'verified'])->prefix('vendor')->name('vendor.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Products — vendor sees only their own
    Route::resource('products', ProductController::class);
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'destroyImage'])->name('products.images.destroy');

    // Orders — only orders containing their products
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

    // Earnings & payouts
    Route::get('earnings&payouts', [EarningsController::class, 'index'])->name('earnings.index');
    Route::post('earnings&payouts/payout', [EarningsController::class, 'requestPayout'])->name('earnings.payout');

    // Store settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
});