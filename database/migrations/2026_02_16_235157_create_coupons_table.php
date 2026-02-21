<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('type', ['percentage', 'fixed', 'free_shipping']);
            $table->decimal('value', 10, 2);
            
            $table->decimal('minimum_order_amount', 10, 2)->nullable();
            $table->decimal('maximum_discount', 10, 2)->nullable(); // cap for percentage
            
            $table->integer('usage_limit')->nullable(); // total uses
            $table->integer('usage_limit_per_user')->default(1);
            $table->integer('used_count')->default(0);
            
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            
            $table->json('applies_to')->nullable(); // {"products": [1,2,3], "categories": [4,5]}
            $table->json('excludes')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('code');
            $table->index(['is_active', 'valid_from', 'valid_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};