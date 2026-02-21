<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['category', 'brand', 'images', 'user'])
            ->withCount('orderItems');

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate(15)->through(fn ($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'price' => $product->price,
            'sale_price' => $product->sale_price,
            'stock_quantity' => $product->stock_quantity,
            'stock_status' => $product->stock_status,
            'status' => $product->status,
            'is_featured' => $product->is_featured,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
            ] : null,
            'primary_image' => $product->getPrimaryImageUrl(),
            'total_sales' => $product->order_items_count,
            'created_at' => $product->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'category', 'sort', 'direction']),
            'categories' => Category::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new product
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::select('id', 'name', 'parent_id')->get(),
            'brands' => Brand::where('is_active', true)->select('id', 'name')->get(),
            'tags' => Tag::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug',
            'sku' => 'nullable|string|unique:products,sku',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'sale_start' => 'nullable|date',
            'sale_end' => 'nullable|date|after:sale_start',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'track_inventory' => 'boolean',
            'allow_backorders' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'is_featured' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['user_id'] = auth()->id();
        $validated['stock_status'] = (!$validated['track_inventory'] || $validated['stock_quantity'] > 0)
            ? 'in_stock'
            : 'out_of_stock';

        $product = Product::create($validated);

        if (isset($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');

                $product->images()->create([
                    'image_path' => Storage::url($path),
                    'alt_text' => $validated['name'],
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified product
     */
    public function show(Product $product): Response
    {
        $product->load(['category', 'brand', 'images', 'variants', 'tags', 'reviews.user']);

        return Inertia::render('Admin/Products/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'cost_price' => $product->cost_price,
                'stock_quantity' => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'stock_status' => $product->stock_status,
                'track_inventory' => $product->track_inventory,
                'allow_backorders' => $product->allow_backorders,
                'status' => $product->status,
                'is_featured' => $product->is_featured,
                'weight' => $product->weight,
                'length' => $product->length,
                'width' => $product->width,
                'height' => $product->height,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'views_count' => $product->views_count,
                'category' => $product->category,
                'brand' => $product->brand,
                'images' => $product->images,
                'variants' => $product->variants,
                'tags' => $product->tags,
                'reviews' => $product->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'title' => $r->title,
                    'review' => $r->review,
                    'is_approved' => $r->is_approved,
                    'is_verified_purchase' => $r->is_verified_purchase,
                    'user' => ['name' => $r->user->name],
                    'created_at' => $r->created_at->format('M d, Y'),
                ]),
                'average_rating' => $product->getAverageRating(),
                'created_at' => $product->created_at->format('M d, Y'),
                'updated_at' => $product->updated_at->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified product
     */
    public function edit(Product $product): Response
    {
        $product->load(['images', 'variants', 'tags']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'sale_start' => $product->sale_start?->format('Y-m-d'),
                'sale_end' => $product->sale_end?->format('Y-m-d'),
                'cost_price' => $product->cost_price,
                'stock_quantity' => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'track_inventory' => $product->track_inventory,
                'allow_backorders' => $product->allow_backorders,
                'weight' => $product->weight,
                'length' => $product->length,
                'width' => $product->width,
                'height' => $product->height,
                'is_featured' => $product->is_featured,
                'status' => $product->status,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'images' => $product->images,
                'variants' => $product->variants,
                'tags' => $product->tags->pluck('id'),
            ],
            'categories' => Category::select('id', 'name', 'parent_id')->get(),
            'brands' => Brand::where('is_active', true)->select('id', 'name')->get(),
            'tags' => Tag::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug,' . $product->id,
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'sale_start' => 'nullable|date',
            'sale_end' => 'nullable|date|after:sale_start',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'track_inventory' => 'boolean',
            'allow_backorders' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'is_featured' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'removed_image_ids' => 'nullable|array',
            'removed_image_ids.*' => 'integer|exists:product_images,id',
        ]);

        $validated['stock_status'] = (!$validated['track_inventory'] || $validated['stock_quantity'] > 0)
            ? 'in_stock'
            : 'out_of_stock';

        $product->update($validated);

        if (isset($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        // Remove deleted images
        if (!empty($validated['removed_image_ids'])) {
            $imagesToRemove = $product->images()->whereIn('id', $validated['removed_image_ids'])->get();
            foreach ($imagesToRemove as $image) {
                Storage::disk('public')->delete(ltrim(parse_url($image->image_path, PHP_URL_PATH), '/storage/'));
                $image->delete();
            }

            // Re-assign primary if it was removed
            if (!$product->images()->where('is_primary', true)->exists()) {
                $product->images()->first()?->update(['is_primary' => true]);
            }
        }

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $currentMax = $product->images()->max('sort_order') ?? -1;

            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $isFirst = $index === 0 && !$product->images()->exists();

                $product->images()->create([
                    'image_path' => Storage::url($path),
                    'alt_text' => $validated['name'],
                    'sort_order' => $currentMax + $index + 1,
                    'is_primary' => $isFirst,
                ]);
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product (soft delete)
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully!');
    }

    /**
     * Delete a single product image via AJAX
     */
    public function destroyImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, 403);

        Storage::disk('public')->delete(ltrim(parse_url($image->image_path, PHP_URL_PATH), '/storage/'));
        $image->delete();

        // Re-assign primary if needed
        if (!$product->images()->where('is_primary', true)->exists()) {
            $product->images()->first()?->update(['is_primary' => true]);
        }

        return response()->json(['success' => true]);
    }
}