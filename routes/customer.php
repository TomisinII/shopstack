<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Customer\DashboardController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\SettingController;


Route::middleware(['auth', 'customer', 'verified'])->prefix('account')->name('account.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/orders',    [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/buy-again', [OrderController::class, 'buyAgain'])->name('orders.buy-again');

    Route::get('/wishlist',  [WishlistController::class, 'index'])->name('wishlist.index');

    Route::get('/addresses', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.setDefault');

    Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');
    Route::post('/payment', [PaymentController::class, 'store'])->name('payment.store');
    Route::patch('/payment/{paymentMethod}/default', [PaymentController::class, 'setDefault'])->name('payment.default');
    Route::delete('/payment/{paymentMethod}', [PaymentController::class, 'destroy'])->name('payment.destroy');

    Route::get('/profile', [SettingController::class, 'index'])->name('profile');
    Route::patch('/profile', [SettingController::class, 'updateProfile'])->name('profile.update');
    Route::patch('/profile/password', [SettingController::class, 'updatePassword'])->name('profile.password');
    Route::patch('/profile/notifications', [SettingController::class, 'updateNotifications'])->name('profile.notifications');
    Route::patch('/profile/preferences', [SettingController::class, 'updatePreferences'])->name('profile.preferences');
});
