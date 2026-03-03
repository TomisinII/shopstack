<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'brand_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'price',
        'sale_price',
        'sale_start',
        'sale_end',
        'cost_price',
        'stock_quantity',
        'low_stock_threshold',
        'stock_status',
        'track_inventory',
        'allow_backorders',
        'weight',
        'length',
        'width',
        'height',
        'is_featured',
        'status',
        'views_count',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'sale_start' => 'datetime',
        'sale_end' => 'datetime',
        'track_inventory' => 'boolean',
        'allow_backorders' => 'boolean',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
    ];

    // =====================================================
    // RELATIONSHIPS
    // =====================================================

    /**
     * Vendor/Admin who created the product (Many-to-One)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Category (Many-to-One)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Brand (Many-to-One)
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Product Images (One-to-Many)
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Primary/Main Image
     */
    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Product Variants (One-to-Many)
     * For products with size/color options
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Tags (Many-to-Many)
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }

    /**
     * Reviews (One-to-Many)
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Approved Reviews only
     */
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    /**
     * Order Items (One-to-Many)
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Wishlists (One-to-Many)
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    // =====================================================
    // SCOPES (For Filtering)
    // =====================================================

    /**
     * Scope: Only published products
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: Only in-stock products
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock_status', 'in_stock')
                     ->where('stock_quantity', '>', 0);
    }

    /**
     * Scope: Featured products
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Products on sale
     */
    public function scopeOnSale(Builder $query): Builder
    {
        return $query->whereNotNull('sale_price')
                     ->where(function($q) {
                         $q->whereNull('sale_start')
                           ->orWhere('sale_start', '<=', now());
                     })
                     ->where(function($q) {
                         $q->whereNull('sale_end')
                           ->orWhere('sale_end', '>=', now());
                     });
    }

    /**
     * Scope: Search by name or description
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('sku', 'like', "%{$search}%");
        });
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    /**
     * Get the current selling price (considers sale price)
     */
    public function getCurrentPrice(): float
    {
        if ($this->isOnSale()) {
            return (float) $this->sale_price;
        }
        return (float) $this->price;
    }

    /**
     * Check if product is currently on sale
     */
    public function isOnSale(): bool
    {
        if (!$this->sale_price || $this->sale_price >= $this->price) {
            return false;
        }

        $now = now();

        if ($this->sale_start && $now->lt($this->sale_start)) {
            return false;
        }

        if ($this->sale_end && $now->gt($this->sale_end)) {
            return false;
        }

        return true;
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentage(): int
    {
        if (!$this->isOnSale()) {
            return 0;
        }

        return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    /**
     * Check if product is low on stock
     */
    public function isLowStock(): bool
    {
        return $this->track_inventory 
               && $this->stock_quantity <= $this->low_stock_threshold 
               && $this->stock_quantity > 0;
    }

    /**
     * Check if product is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->stock_status === 'out_of_stock' 
               || ($this->track_inventory && $this->stock_quantity <= 0);
    }

    /**
     * Get average rating
     */
    public function getAverageRating(): float
    {
        return (float) $this->approvedReviews()->avg('rating') ?? 0;
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Get primary image URL
     */
    public function getPrimaryImageUrl(): ?string
    {
        $images = $this->relationLoaded('images')
            ? $this->images
            : $this->images()->get();

        $image = $images->firstWhere('is_primary', true) ?? $images->first();

        if (!$image || !$image->url) {
            return null;
        }

        if (str_starts_with($image->url, 'http')) {
            return $image->url;
        }

        return Storage::url($image->url);
    }
}