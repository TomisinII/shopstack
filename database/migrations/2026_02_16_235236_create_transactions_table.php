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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            
            $table->enum('type', ['earning', 'payout', 'refund', 'commission']);
            $table->decimal('amount', 12, 2);
            $table->decimal('commission_amount', 12, 2)->default(0.00);
            $table->decimal('net_amount', 12, 2); // amount - commission
            
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('description')->nullable();
            
            $table->timestamps();

            $table->index('vendor_id');
            $table->index('order_id');
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};