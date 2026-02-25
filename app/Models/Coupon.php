<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'type', 'value', 'minimum_order_amount', 'maximum_discount',
        'usage_limit', 'usage_limit_per_user', 'used_count', 'valid_from',
        'valid_until', 'applies_to', 'excludes', 'is_active',
    ];

    protected $casts = [
        'value'                => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount'     => 'decimal:2',
        'usage_limit'          => 'integer',
        'usage_limit_per_user' => 'integer',
        'used_count'           => 'integer',
        'valid_from'           => 'datetime',
        'valid_until'          => 'datetime',
        'applies_to'           => 'array',
        'excludes'             => 'array',
        'is_active'            => 'boolean',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Scope: coupons that are currently usable.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            // Not started yet
            ->where(function (Builder $q) {
                $q->whereNull('valid_from')
                  ->orWhere('valid_from', '<=', now());
            })
            // Already expired
            ->where(function (Builder $q) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', now());
            })
            // Usage limit exhausted
            ->where(function (Builder $q) {
                $q->whereNull('usage_limit')
                  ->orWhereColumn('used_count', '<', 'usage_limit');
            });
    }

    /**
     * Scope: coupons that have expired (past valid_until).
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->whereNotNull('valid_until')
                     ->where('valid_until', '<', now());
    }

    /**
     * Scope: coupons that are inactive or expired or exhausted.
     */
    public function scopeInactive(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where('is_active', false)
              ->orWhere(fn (Builder $q2) => $q2->whereNotNull('valid_until')->where('valid_until', '<', now()))
              ->orWhere(fn (Builder $q2) => $q2->whereNotNull('usage_limit')->whereColumn('used_count', '>=', 'usage_limit'));
        });
    }

    public function isValid(): bool
    {
        if (! $this->is_active) return false;
        if ($this->valid_from && now()->lt($this->valid_from)) return false;
        if ($this->valid_until && now()->gt($this->valid_until)) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;

        return true;
    }

    /**
     * Human-readable status for display.
     */
    public function getStatusAttribute(): string
    {
        if (! $this->is_active) return 'inactive';
        if ($this->valid_until && now()->gt($this->valid_until)) return 'expired';
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return 'exhausted';
        if ($this->valid_from && now()->lt($this->valid_from)) return 'scheduled';

        return 'active';
    }
}