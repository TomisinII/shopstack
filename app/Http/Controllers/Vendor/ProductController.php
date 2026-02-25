<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    private function vendorProducts()
    {
        return Product::where('user_id', auth()->id());
    }

    public function index(Request $request): Response
    {
        $query = $this->vendorProducts()
            ->with(['images'])
            ->withCount('orderItems');

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $query->orderBy(
            $request->get('sort', 'created_at'),
            $request->get('direction', 'desc')
        );

        $products = $query->paginate(15)->through(fn($p) => [
            'id'             => $p->id,
            'name'           => $p->name,
            'sku'            => $p->sku,
            'price'          => $p->getCurrentPrice(),
            'original_price' => $p->price,
            'on_sale'        => $p->isOnSale(),
            'stock_quantity' => $p->stock_quantity,
            'stock_status'   => $p->stock_status,
            'status'         => $p->status,
            'total_sales'    => $p->order_items_count,
            'primary_image'  => $p->getPrimaryImageUrl(),
            'created_at'     => $p->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Vendor/Products/Index', [
            'products' => $products,
            'filters'  => $request->only(['search', 'sort', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendor/Products/Create', [
            'categories' => Category::select('id', 'name', 'parent_id')->get(),
            'brands'     => Brand::where('is_active', true)->select('id', 'name')->get(),
            'tags'       => Tag::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateProduct($request);

        $validated['slug']         = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['user_id']      = auth()->id();
        $validated['stock_status'] = $this->resolveStockStatus($validated);

        $product = Product::create($validated);

        if (!empty($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        $this->handleImageUploads($request, $product, $validated['name']);

        return redirect()->route('vendor.products.index')
            ->with('success', 'Product created and submitted for review.');
    }

    public function show(Product $product): Response
    {
        abort_unless($product->user_id === auth()->id(), 403);

        $product->load(['category', 'brand', 'images', 'variants', 'tags', 'approvedReviews.user']);

        return Inertia::render('Vendor/Products/Show', [
            'product' => [
                'id'                  => $product->id,
                'name'                => $product->name,
                'slug'                => $product->slug,
                'sku'                 => $product->sku,
                'short_description'   => $product->short_description,
                'description'         => $product->description,
                'price'               => $product->price,
                'sale_price'          => $product->sale_price,
                'cost_price'          => $product->cost_price,
                'stock_quantity'      => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'stock_status'        => $product->stock_status,
                'track_inventory'     => $product->track_inventory,
                'allow_backorders'    => $product->allow_backorders,
                'status'              => $product->status,
                'is_featured'         => $product->is_featured,
                'weight'              => $product->weight,
                'length'              => $product->length,
                'width'               => $product->width,
                'height'              => $product->height,
                'meta_title'          => $product->meta_title,
                'meta_description'    => $product->meta_description,
                'views_count'         => $product->views_count,
                'category'            => $product->category,
                'brand'               => $product->brand,
                'images'              => $product->images,
                'variants'            => $product->variants,
                'tags'                => $product->tags,
                'average_rating'      => $product->getAverageRating(),
                'reviews'             => $product->approvedReviews->map(fn($r) => [
                    'id'                    => $r->id,
                    'rating'                => $r->rating,
                    'title'                 => $r->title,
                    'review'                => $r->review,
                    'is_verified_purchase'  => $r->is_verified_purchase,
                    'user'                  => ['name' => $r->user->name],
                    'created_at'            => $r->created_at->format('M d, Y'),
                ]),
                'created_at' => $product->created_at->format('M d, Y'),
                'updated_at' => $product->updated_at->format('M d, Y'),
            ],
        ]);
    }

    public function edit(Product $product): Response
    {
        abort_unless($product->user_id === auth()->id(), 403);

        $product->load(['images', 'variants', 'tags']);

        return Inertia::render('Vendor/Products/Edit', [
            'product' => [
                'id'                  => $product->id,
                'name'                => $product->name,
                'slug'                => $product->slug,
                'sku'                 => $product->sku,
                'category_id'         => $product->category_id,
                'brand_id'            => $product->brand_id,
                'short_description'   => $product->short_description,
                'description'         => $product->description,
                'price'               => $product->price,
                'sale_price'          => $product->sale_price,
                'sale_start'          => $product->sale_start?->format('Y-m-d'),
                'sale_end'            => $product->sale_end?->format('Y-m-d'),
                'cost_price'          => $product->cost_price,
                'stock_quantity'      => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'track_inventory'     => $product->track_inventory,
                'allow_backorders'    => $product->allow_backorders,
                'weight'              => $product->weight,
                'length'              => $product->length,
                'width'               => $product->width,
                'height'              => $product->height,
                'is_featured'         => $product->is_featured,
                'status'              => $product->status,
                'meta_title'          => $product->meta_title,
                'meta_description'    => $product->meta_description,
                'images'              => $product->images,
                'variants'            => $product->variants,
                'tags'                => $product->tags->pluck('id'),
            ],
            'categories' => Category::select('id', 'name', 'parent_id')->get(),
            'brands'     => Brand::where('is_active', true)->select('id', 'name')->get(),
            'tags'       => Tag::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->user_id === auth()->id(), 403);

        $validated = $this->validateProduct($request, $product->id);
        $validated['stock_status'] = $this->resolveStockStatus($validated);

        $product->update($validated);

        if (isset($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        }

        if (!empty($validated['removed_image_ids'])) {
            $toRemove = $product->images()->whereIn('id', $validated['removed_image_ids'])->get();
            foreach ($toRemove as $image) {
                Storage::disk('public')->delete(ltrim(parse_url($image->image_path, PHP_URL_PATH), '/storage/'));
                $image->delete();
            }
            if (!$product->images()->where('is_primary', true)->exists()) {
                $product->images()->first()?->update(['is_primary' => true]);
            }
        }

        $this->handleImageUploads($request, $product, $validated['name']);

        return redirect()->route('vendor.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        abort_unless($product->user_id === auth()->id(), 403);

        $product->delete();

        return redirect()->route('vendor.products.index')
            ->with('success', 'Product deleted.');
    }

    public function destroyImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($product->user_id === auth()->id(), 403);
        abort_unless($image->product_id === $product->id, 403);

        Storage::disk('public')->delete(ltrim(parse_url($image->image_path, PHP_URL_PATH), '/storage/'));
        $image->delete();

        if (!$product->images()->where('is_primary', true)->exists()) {
            $product->images()->first()?->update(['is_primary' => true]);
        }

        return response()->json(['success' => true]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function resolveStockStatus(array $data): string
    {
        return (!$data['track_inventory'] || $data['stock_quantity'] > 0)
            ? 'in_stock'
            : 'out_of_stock';
    }

    private function validateProduct(Request $request, ?int $productId = null): array
    {
        $uniqueSuffix = $productId ? ",$productId" : '';

        return $request->validate([
            'name'                => 'required|string|max:255',
            'slug'                => "nullable|string|unique:products,slug{$uniqueSuffix}",
            'sku'                 => "nullable|string|unique:products,sku{$uniqueSuffix}",
            'category_id'         => 'required|exists:categories,id',
            'brand_id'            => 'nullable|exists:brands,id',
            'short_description'   => 'nullable|string|max:500',
            'description'         => 'required|string',
            'price'               => 'required|numeric|min:0',
            'sale_price'          => 'nullable|numeric|min:0|lt:price',
            'sale_start'          => 'nullable|date',
            'sale_end'            => 'nullable|date|after:sale_start',
            'cost_price'          => 'nullable|numeric|min:0',
            'stock_quantity'      => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'track_inventory'     => 'boolean',
            'allow_backorders'    => 'boolean',
            'weight'              => 'nullable|numeric|min:0',
            'length'              => 'nullable|numeric|min:0',
            'width'               => 'nullable|numeric|min:0',
            'height'              => 'nullable|numeric|min:0',
            'is_featured'         => 'boolean',
            'status'              => 'required|in:draft,published,archived',
            'meta_title'          => 'nullable|string|max:255',
            'meta_description'    => 'nullable|string',
            'tags'                => 'nullable|array',
            'tags.*'              => 'exists:tags,id',
            'images'              => 'nullable|array|max:10',
            'images.*'            => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'removed_image_ids'   => 'nullable|array',
            'removed_image_ids.*' => 'integer|exists:product_images,id',
        ]);
    }

    private function handleImageUploads(Request $request, Product $product, string $name): void
    {
        if (!$request->hasFile('images')) {
            return;
        }

        $currentMax = $product->images()->max('sort_order') ?? -1;

        foreach ($request->file('images') as $index => $image) {
            $path    = $image->store('products', 'public');
            $isFirst = $index === 0 && !$product->images()->exists();

            $product->images()->create([
                'image_path' => Storage::url($path),
                'alt_text'   => $name,
                'sort_order' => $currentMax + $index + 1,
                'is_primary' => $isFirst,
            ]);
        }
    }
}