<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Products Management
    Route::resource('products', ProductController::class);
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'destroyImage'])->name('products.images.destroy');

    // Categories Management
    Route::resource('categories', CategoryController::class);   
    

    // Orders Management
    Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
    Route::resource('orders', OrderController::class)->only(['index', 'show', 'update']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('orders/{order}/notify', [OrderController::class, 'notify'])->name('orders.notify');

    // Customers Management
    Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
    Route::resource('customers', CustomerController::class)->only(['index', 'show']);

    // Vendors Management
    Route::get('vendors', [VendorController::class, 'index'])->name('vendors.index');
    Route::get('vendors/{vendor}', [VendorController::class, 'show'])->name('vendors.show');
    Route::post('vendors/{vendor}/approve',[VendorController::class, 'approve'])->name('vendors.approve');
    Route::post('vendors/{vendor}/suspend',[VendorController::class, 'suspend'])->name('vendors.suspend');  

    // Coupons Management
    Route::post('coupons/{coupon}/duplicate', [CouponController::class, 'duplicate'])->name('coupons.duplicate');
    Route::resource('coupons', CouponController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Reports Management
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
        Route::get('/products', [ReportController::class, 'products'])->name('products');
        Route::get('/customers', [ReportController::class, 'customers'])->name('customers');
        Route::get('/vendors', [ReportController::class, 'vendors'])->name('vendors');
        Route::get('/tax', [ReportController::class, 'tax'])->name('tax');
        Route::get('/coupons', [ReportController::class, 'coupons'])->name('coupons');
    });

    Route::get('settings',  [SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
});