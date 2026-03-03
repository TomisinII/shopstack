<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'payment_status',
        'payment_method',
        'payment_intent_id',   // ← added
        'payment_reference',   // ← added
        'subtotal',
        'shipping_cost',
        'tax_amount',
        'discount_amount',
        'total',
        'currency',
        'coupon_code',
        // Shipping address
        'shipping_full_name',
        'shipping_phone',
        'shipping_address_line_1',
        'shipping_address_line_2',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'shipping_country',
        'shipping_method',     // ← added
        // Billing address
        'billing_full_name',
        'billing_phone',
        'billing_address_line_1',
        'billing_city',
        'billing_state',
        'billing_zip',
        'billing_country',
        // Tracking
        'tracking_number',
        'shipped_at',
        'delivered_at',
        'customer_notes',
        'admin_notes',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'shipping_cost'   => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total'           => 'decimal:2',
        'shipped_at'      => 'datetime',
        'delivered_at'    => 'datetime',
    ];

    // =====================================================
    // RELATIONSHIPS
    // =====================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function couponUsages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // =====================================================
    // SCOPES
    // =====================================================

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing(Builder $query): Builder
    {
        return $query->where('status', 'processing');
    }

    public function scopeShipped(Builder $query): Builder
    {
        return $query->where('status', 'shipped');
    }

    public function scopeDelivered(Builder $query): Builder
    {
        return $query->where('status', 'delivered');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDays(30));
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    public static function generateOrderNumber(): string
    {
        $year      = now()->year;
        $lastOrder = self::whereYear('created_at', $year)
                         ->orderBy('id', 'desc')
                         ->first();

        $nextNumber = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;

        return sprintf('ORD-%d-%04d', $year, $nextNumber);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function canBeRefunded(): bool
    {
        return $this->payment_status === 'paid'
               && in_array($this->status, ['processing', 'shipped', 'delivered']);
    }

    public function getShippingAddressAttribute(): string
    {
        $parts = array_filter([
            $this->shipping_address_line_1,
            $this->shipping_address_line_2,
            $this->shipping_city,
            $this->shipping_state,
            $this->shipping_zip,
            $this->shipping_country,
        ]);

        return implode(', ', $parts);
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending'    => 'yellow',
            'processing' => 'blue',
            'shipped'    => 'indigo',
            'delivered'  => 'green',
            'cancelled'  => 'red',
            'refunded'   => 'gray',
            default      => 'gray',
        };
    }

    public function getPaymentStatusColorAttribute(): string
    {
        return match ($this->payment_status) {
            'paid'     => 'green',
            'pending'  => 'yellow',
            'failed'   => 'red',
            'refunded' => 'gray',
            default    => 'gray',
        };
    }

    public function markAsPaid(): void
    {
        $this->update([
            'payment_status' => 'paid',
            'status'         => 'processing',
        ]);
    }

    public function markAsShipped(?string $trackingNumber = null): void
    {
        $this->update([
            'status'          => 'shipped',
            'tracking_number' => $trackingNumber,
            'shipped_at'      => now(),
        ]);
    }

    public function markAsDelivered(): void
    {
        $this->update([
            'status'       => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        if ($this->canBeCancelled()) {
            $this->update(['status' => 'cancelled']);

            foreach ($this->items as $item) {
                if ($item->product && $item->product->track_inventory) {
                    $item->product->increment('stock_quantity', $item->quantity);
                }
            }
        }
    }
}