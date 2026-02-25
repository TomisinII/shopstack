<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = User::role('Vendor')->where('email', '!=', 'pending@shopstack.com')->get();
        $admin   = User::role('Admin')->first();

        $products = $this->productData();

        foreach ($products as $data) {
            $category = Category::where('slug', $data['category'])->first();
            $brand    = Brand::where('slug', Str::slug($data['brand']))->first();

            // Assign to vendors round-robin, admin owns ~20% of products
            static $index = 0;
            $owner = ($index % 5 === 0) ? $admin : $vendors[$index % $vendors->count()];
            $index++;

            $stockQty = $data['stock'] ?? rand(10, 200);

            $product = Product::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'user_id'             => $owner->id,
                    'category_id'         => $category?->id,
                    'brand_id'            => $brand?->id,
                    'name'                => $data['name'],
                    'slug'                => Str::slug($data['name']),
                    'sku'                 => strtoupper(Str::random(3)) . '-' . rand(1000, 9999),
                    'short_description'   => $data['short_desc'],
                    'description'         => $data['description'],
                    'price'               => $data['price'],
                    'sale_price'          => $data['sale_price'] ?? null,
                    'sale_start'          => isset($data['sale_price']) ? now()->subDays(5) : null,
                    'sale_end'            => isset($data['sale_price']) ? now()->addDays(20) : null,
                    'cost_price'          => round($data['price'] * 0.6, 2),
                    'stock_quantity'      => $stockQty,
                    'low_stock_threshold' => 10,
                    'stock_status'        => $stockQty > 0 ? 'in_stock' : 'out_of_stock',
                    'track_inventory'     => true,
                    'allow_backorders'    => false,
                    'weight'              => $data['weight'] ?? round(rand(1, 30) / 10, 2),
                    'is_featured'         => $data['featured'] ?? false,
                    'status'              => 'published',
                    'views_count'         => rand(50, 5000),
                    'meta_title'          => $data['name'] . ' | ShopStack',
                    'meta_description'    => $data['short_desc'],
                ]
            );

            $this->attachImages($product, $data);
            $this->attachTags($product, $data['tags'] ?? []);

            if (!empty($data['variants'])) {
                $this->createVariants($product, $data['variants']);
            }
        }
    }

    private function attachImages(Product $product, array $data): void
    {
        // Use placeholder images categorised by type for realistic dev experience
        $imageBase = 'products/placeholder';

        $primaryCreated = ProductImage::where('product_id', $product->id)->where('is_primary', true)->exists();
        if ($primaryCreated) return;

        $imageCount = rand(2, 5);
        for ($i = 0; $i < $imageCount; $i++) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "{$imageBase}/{$product->id}-{$i}.jpg",
                'alt_text'   => $product->name . ($i > 0 ? " - view " . ($i + 1) : ''),
                'sort_order' => $i,
                'is_primary' => $i === 0,
            ]);
        }
    }

    private function attachTags(Product $product, array $tagNames): void
    {
        $tagIds = [];
        foreach ($tagNames as $name) {
            $tag = Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'slug' => Str::slug($name)]
            );
            $tagIds[] = $tag->id;
        }
        $product->tags()->syncWithoutDetaching($tagIds);
    }

    private function createVariants(Product $product, array $variants): void
    {
        $existing = $product->variants()->count();
        if ($existing > 0) return;

        foreach ($variants as $v) {
            ProductVariant::create([
                'product_id'     => $product->id,
                'sku'            => strtoupper(Str::random(3)) . '-' . rand(100, 999),
                'name'           => $v['name'],
                'price'          => $v['price'] ?? $product->price,
                'sale_price'     => $v['sale_price'] ?? $product->sale_price,
                'stock_quantity' => rand(5, 60),
                'attributes'     => $v['attributes'],
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Product data
    // ──────────────────────────────────────────────────────────────
    private function productData(): array
    {
        return [
            // ── ELECTRONICS ───────────────────────────────────────
            [
                'name'       => 'Samsung Galaxy S24 Ultra',
                'category'   => 'smartphones',
                'brand'      => 'Samsung',
                'short_desc' => '6.8" QHD+ display, 200MP camera, built-in S Pen, 5000mAh battery.',
                'description'=> '<h2>Galaxy S24 Ultra</h2><p>Experience the pinnacle of Samsung innovation with the Galaxy S24 Ultra. Features a titanium frame, advanced AI camera system, and the most powerful Snapdragon chipset available.</p><ul><li>6.8" QHD+ 120Hz Dynamic AMOLED display</li><li>200MP main + 50MP periscope telephoto</li><li>Snapdragon 8 Gen 3</li><li>Built-in S Pen with AI features</li><li>5000mAh battery, 45W fast charging</li></ul>',
                'price'      => 1299000,
                'sale_price' => 1199000,
                'weight'     => 0.23,
                'featured'   => true,
                'stock'      => 45,
                'tags'       => ['smartphone', 'samsung', 'flagship', '5g', 'android'],
                'variants'   => [
                    ['name' => '256GB / Titanium Black',  'price' => 1299000, 'sale_price' => 1199000, 'attributes' => ['storage' => '256GB', 'color' => 'Titanium Black']],
                    ['name' => '512GB / Titanium Gray',   'price' => 1449000, 'sale_price' => 1349000, 'attributes' => ['storage' => '512GB', 'color' => 'Titanium Gray']],
                    ['name' => '1TB / Titanium Violet',   'price' => 1699000,                          'attributes' => ['storage' => '1TB',  'color' => 'Titanium Violet']],
                ],
            ],
            [
                'name'       => 'Apple MacBook Air M3',
                'category'   => 'laptops',
                'brand'      => 'Apple',
                'short_desc' => '13.6" Liquid Retina display, Apple M3 chip, 18-hour battery life.',
                'description'=> '<h2>MacBook Air M3</h2><p>Impossibly thin and light. The M3 chip brings next-level performance to the world\'s most popular laptop. All-day battery life and a stunning Liquid Retina display make it the perfect everyday machine.</p><ul><li>Apple M3 chip (8-core CPU, 10-core GPU)</li><li>13.6" Liquid Retina display</li><li>Up to 18 hours battery</li><li>MagSafe charging</li><li>Fanless design</li></ul>',
                'price'      => 1850000,
                'weight'     => 1.24,
                'featured'   => true,
                'stock'      => 30,
                'tags'       => ['laptop', 'apple', 'macbook', 'm3', 'ultrabook'],
                'variants'   => [
                    ['name' => '8GB / 256GB SSD / Midnight',   'price' => 1850000, 'attributes' => ['ram' => '8GB',  'storage' => '256GB', 'color' => 'Midnight']],
                    ['name' => '16GB / 512GB SSD / Starlight',  'price' => 2250000, 'attributes' => ['ram' => '16GB', 'storage' => '512GB', 'color' => 'Starlight']],
                    ['name' => '24GB / 1TB SSD / Space Gray',   'price' => 2750000, 'attributes' => ['ram' => '24GB', 'storage' => '1TB',   'color' => 'Space Gray']],
                ],
            ],
            [
                'name'       => 'Sony WH-1000XM5 Headphones',
                'category'   => 'audio-headphones',
                'brand'      => 'Sony',
                'short_desc' => 'Industry-leading noise cancellation, 30hr battery, multipoint connection.',
                'description'=> '<h2>WH-1000XM5</h2><p>Sony\'s best-ever noise cancelling headphones. Eight microphones and two processors deliver unprecedented silence wherever you go. Crystal clear hands-free calling with precise voice pickup.</p>',
                'price'      => 185000,
                'sale_price' => 165000,
                'weight'     => 0.25,
                'featured'   => true,
                'stock'      => 80,
                'tags'       => ['headphones', 'sony', 'noise-cancelling', 'wireless', 'premium-audio'],
                'variants'   => [
                    ['name' => 'Black',  'attributes' => ['color' => 'Black']],
                    ['name' => 'Silver', 'attributes' => ['color' => 'Silver']],
                ],
            ],
            [
                'name'       => 'Tecno Camon 30 Pro',
                'category'   => 'smartphones',
                'brand'      => 'Tecno',
                'short_desc' => '6.78" AMOLED display, 50MP triple camera, 5000mAh, 45W charging.',
                'description'=> '<h2>Tecno Camon 30 Pro</h2><p>Redefining photography for the African market. The Camon 30 Pro delivers pro-grade portraits with AI-enhanced processing and an ultra-bright AMOLED display.</p>',
                'price'      => 285000,
                'sale_price' => 265000,
                'weight'     => 0.19,
                'featured'   => false,
                'stock'      => 120,
                'tags'       => ['smartphone', 'tecno', 'android', 'budget-flagship'],
                'variants'   => [
                    ['name' => '8GB/256GB - Moonlit Black',   'price' => 285000, 'attributes' => ['ram' => '8GB',  'storage' => '256GB', 'color' => 'Moonlit Black']],
                    ['name' => '12GB/256GB - Starry Silver',  'price' => 315000, 'attributes' => ['ram' => '12GB', 'storage' => '256GB', 'color' => 'Starry Silver']],
                ],
            ],
            [
                'name'       => 'JBL Charge 5 Portable Speaker',
                'category'   => 'audio-headphones',
                'brand'      => 'JBL',
                'short_desc' => 'Powerful portable Bluetooth speaker, IP67 waterproof, 20hr playtime.',
                'description'=> '<h2>JBL Charge 5</h2><p>Fill any space with rich JBL Pro Sound. The Charge 5 adds a tweeter for clearer highs, while the separate woofer and optimised port deliver low-distortion bass.</p>',
                'price'      => 68000,
                'weight'     => 0.96,
                'featured'   => false,
                'stock'      => 95,
                'tags'       => ['bluetooth-speaker', 'jbl', 'waterproof', 'portable'],
                'variants'   => [
                    ['name' => 'Black',  'attributes' => ['color' => 'Black']],
                    ['name' => 'Blue',   'attributes' => ['color' => 'Blue']],
                    ['name' => 'Red',    'attributes' => ['color' => 'Red']],
                    ['name' => 'Green',  'attributes' => ['color' => 'Green']],
                ],
            ],
            [
                'name'       => 'Infinix Note 40 Pro',
                'category'   => 'smartphones',
                'brand'      => 'Infinix',
                'short_desc' => '6.78" AMOLED 120Hz, 108MP camera, 100W all-round fast charge.',
                'description'=> '<h2>Infinix Note 40 Pro</h2><p>The ultimate productivity powerhouse. With an all-round fast charge system and flagship-grade display, stay productive all day without slowing down.</p>',
                'price'      => 220000,
                'weight'     => 0.20,
                'featured'   => false,
                'stock'      => 75,
                'tags'       => ['smartphone', 'infinix', 'fast-charge', 'amoled'],
            ],
            [
                'name'       => 'Anker PowerCore 26800mAh Power Bank',
                'category'   => 'accessories',
                'brand'      => 'Anker',
                'short_desc' => '26800mAh, triple outputs, charges 3 devices simultaneously.',
                'description'=> '<h2>Anker PowerCore 26800</h2><p>Our highest-capacity power bank charges your phone up to 6 times. PowerIQ and VoltageBoost combine for the fastest possible charging speed for any device.</p>',
                'price'      => 32000,
                'weight'     => 0.48,
                'featured'   => false,
                'stock'      => 200,
                'tags'       => ['power-bank', 'anker', 'accessories', 'charging'],
            ],
            [
                'name'       => 'Apple iPad Pro M4 11-inch',
                'category'   => 'tablets',
                'brand'      => 'Apple',
                'short_desc' => 'Ultra Retina XDR OLED display, M4 chip, Apple Pencil Pro support.',
                'description'=> '<h2>iPad Pro M4</h2><p>The thinnest Apple product ever. With the groundbreaking M4 chip and Ultra Retina XDR OLED display, iPad Pro delivers exceptional performance and stunning visuals.</p>',
                'price'      => 1100000,
                'weight'     => 0.44,
                'featured'   => false,
                'stock'      => 25,
                'tags'       => ['tablet', 'apple', 'ipad', 'm4'],
                'variants'   => [
                    ['name' => '256GB WiFi - Space Black', 'price' => 1100000, 'attributes' => ['storage' => '256GB', 'connectivity' => 'WiFi', 'color' => 'Space Black']],
                    ['name' => '512GB WiFi+Cellular - Silver', 'price' => 1450000, 'attributes' => ['storage' => '512GB', 'connectivity' => 'WiFi+Cellular', 'color' => 'Silver']],
                ],
            ],
            [
                'name'       => 'Samsung Galaxy Watch 7',
                'category'   => 'smart-watches',
                'brand'      => 'Samsung',
                'short_desc' => '1.3" Super AMOLED, advanced health monitoring, BioActive sensor.',
                'description'=> '<h2>Galaxy Watch 7</h2><p>Track every aspect of your health with Samsung\'s most advanced health sensor. From body composition to sleep coaching, Galaxy Watch 7 keeps you informed around the clock.</p>',
                'price'      => 295000,
                'sale_price' => 270000,
                'weight'     => 0.03,
                'featured'   => false,
                'stock'      => 60,
                'tags'       => ['smartwatch', 'samsung', 'health', 'wearable'],
                'variants'   => [
                    ['name' => '40mm - Cream',     'price' => 295000, 'sale_price' => 270000, 'attributes' => ['size' => '40mm', 'color' => 'Cream']],
                    ['name' => '44mm - Green',     'price' => 325000, 'sale_price' => 299000, 'attributes' => ['size' => '44mm', 'color' => 'Green']],
                    ['name' => '44mm - Silver',    'price' => 325000, 'sale_price' => 299000, 'attributes' => ['size' => '44mm', 'color' => 'Silver']],
                ],
            ],

            // ── FASHION ───────────────────────────────────────────
            [
                'name'       => 'Nike Air Force 1 \'07',
                'category'   => 'footwear',
                'brand'      => 'Nike',
                'short_desc' => 'Classic basketball-turned-lifestyle icon with premium leather upper.',
                'description'=> '<h2>Nike Air Force 1 \'07</h2><p>The legend lives on with the Nike Air Force 1 \'07. The classic basketball shoe now stands as an icon of street fashion with a durable leather upper and Air-sole cushioning for all-day comfort.</p>',
                'price'      => 58000,
                'weight'     => 0.35,
                'featured'   => true,
                'stock'      => 150,
                'tags'       => ['sneakers', 'nike', 'shoes', 'classic', 'lifestyle'],
                'variants'   => [
                    ['name' => 'UK 6 / White',  'attributes' => ['size' => 'UK 6',  'color' => 'White']],
                    ['name' => 'UK 7 / White',  'attributes' => ['size' => 'UK 7',  'color' => 'White']],
                    ['name' => 'UK 8 / White',  'attributes' => ['size' => 'UK 8',  'color' => 'White']],
                    ['name' => 'UK 9 / White',  'attributes' => ['size' => 'UK 9',  'color' => 'White']],
                    ['name' => 'UK 10 / White', 'attributes' => ['size' => 'UK 10', 'color' => 'White']],
                    ['name' => 'UK 7 / Black',  'attributes' => ['size' => 'UK 7',  'color' => 'Black']],
                    ['name' => 'UK 8 / Black',  'attributes' => ['size' => 'UK 8',  'color' => 'Black']],
                    ['name' => 'UK 9 / Black',  'attributes' => ['size' => 'UK 9',  'color' => 'Black']],
                ],
            ],
            [
                'name'       => 'Adidas Originals Trefoil Hoodie',
                'category'   => 'mens-clothing',
                'brand'      => 'Adidas',
                'short_desc' => 'Classic Adidas Trefoil logo hoodie in cosy fleece fabric.',
                'description'=> '<h2>Adidas Trefoil Hoodie</h2><p>A wardrobe essential for every sports enthusiast. Made from soft fleece with the iconic Trefoil logo, this hoodie is perfect for casual wear or light workouts.</p>',
                'price'      => 45000,
                'sale_price' => 38000,
                'weight'     => 0.45,
                'featured'   => false,
                'stock'      => 200,
                'tags'       => ['hoodie', 'adidas', 'streetwear', 'men'],
                'variants'   => [
                    ['name' => 'S / Black',  'attributes' => ['size' => 'S', 'color' => 'Black']],
                    ['name' => 'M / Black',  'attributes' => ['size' => 'M', 'color' => 'Black']],
                    ['name' => 'L / Black',  'attributes' => ['size' => 'L', 'color' => 'Black']],
                    ['name' => 'XL / Black', 'attributes' => ['size' => 'XL', 'color' => 'Black']],
                    ['name' => 'S / White',  'attributes' => ['size' => 'S', 'color' => 'White']],
                    ['name' => 'M / White',  'attributes' => ['size' => 'M', 'color' => 'White']],
                    ['name' => 'L / White',  'attributes' => ['size' => 'L', 'color' => 'White']],
                ],
            ],
            [
                'name'       => 'H&M Floral Midi Dress',
                'category'   => 'womens-clothing',
                'brand'      => 'H&M',
                'short_desc' => 'Elegant floral print midi dress with puff sleeves, perfect for events.',
                'description'=> '<h2>H&M Floral Midi Dress</h2><p>Turn heads at any occasion. This floral midi dress features beautiful puff sleeves and a flattering A-line silhouette, made from soft woven fabric.</p>',
                'price'      => 28000,
                'weight'     => 0.30,
                'featured'   => false,
                'stock'      => 180,
                'tags'       => ['dress', 'women', 'floral', 'midi', 'party'],
                'variants'   => [
                    ['name' => 'XS / Blue Floral', 'attributes' => ['size' => 'XS', 'color' => 'Blue Floral']],
                    ['name' => 'S / Blue Floral',  'attributes' => ['size' => 'S',  'color' => 'Blue Floral']],
                    ['name' => 'M / Blue Floral',  'attributes' => ['size' => 'M',  'color' => 'Blue Floral']],
                    ['name' => 'L / Blue Floral',  'attributes' => ['size' => 'L',  'color' => 'Blue Floral']],
                    ['name' => 'XL / Pink Floral', 'attributes' => ['size' => 'XL', 'color' => 'Pink Floral']],
                ],
            ],
            [
                'name'       => 'Nike Dri-FIT Running Shorts',
                'category'   => 'mens-clothing',
                'brand'      => 'Nike',
                'short_desc' => '7" inseam running shorts with Dri-FIT sweat-wicking technology.',
                'description'=> '<h2>Nike Dri-FIT Running Shorts</h2><p>Engineered to keep you cool, dry, and comfortable during every run. The 7" inseam provides great coverage while the lightweight Dri-FIT fabric wicks sweat away.</p>',
                'price'      => 22000,
                'weight'     => 0.12,
                'stock'      => 300,
                'tags'       => ['running', 'shorts', 'nike', 'sportswear', 'men'],
                'variants'   => [
                    ['name' => 'S / Black',   'attributes' => ['size' => 'S',  'color' => 'Black']],
                    ['name' => 'M / Black',   'attributes' => ['size' => 'M',  'color' => 'Black']],
                    ['name' => 'L / Black',   'attributes' => ['size' => 'L',  'color' => 'Black']],
                    ['name' => 'XL / Navy',   'attributes' => ['size' => 'XL', 'color' => 'Navy']],
                    ['name' => 'M / Navy',    'attributes' => ['size' => 'M',  'color' => 'Navy']],
                ],
            ],
            [
                'name'       => 'Leather Crossbody Bag',
                'category'   => 'bags-wallets',
                'brand'      => 'Zara',
                'short_desc' => 'Compact genuine leather crossbody with adjustable strap and gold hardware.',
                'description'=> '<h2>Leather Crossbody Bag</h2><p>Crafted from genuine leather with a soft-touch finish. The structured design keeps your essentials organised while the adjustable strap ensures versatile wearing options.</p>',
                'price'      => 42000,
                'weight'     => 0.40,
                'featured'   => false,
                'stock'      => 60,
                'tags'       => ['bag', 'leather', 'crossbody', 'women', 'accessories'],
                'variants'   => [
                    ['name' => 'Camel',  'attributes' => ['color' => 'Camel']],
                    ['name' => 'Black',  'attributes' => ['color' => 'Black']],
                    ['name' => 'White',  'attributes' => ['color' => 'White']],
                ],
            ],
            [
                'name'       => 'Puma Softride Enzo NXT Sneakers',
                'category'   => 'footwear',
                'brand'      => 'Puma',
                'short_desc' => 'Ultra-soft SOFTRIDE foam midsole running shoe for everyday comfort.',
                'description'=> '<h2>Puma Softride Enzo NXT</h2><p>Step into maximum cushioning. The Softride foam midsole delivers an ultra-soft ride while the breathable mesh upper keeps your feet cool during long days.</p>',
                'price'      => 38000,
                'weight'     => 0.30,
                'stock'      => 110,
                'tags'       => ['sneakers', 'puma', 'running', 'comfort'],
                'variants'   => [
                    ['name' => 'UK 6 / White-Black',   'attributes' => ['size' => 'UK 6',  'color' => 'White-Black']],
                    ['name' => 'UK 7 / White-Black',   'attributes' => ['size' => 'UK 7',  'color' => 'White-Black']],
                    ['name' => 'UK 8 / White-Black',   'attributes' => ['size' => 'UK 8',  'color' => 'White-Black']],
                    ['name' => 'UK 9 / Navy-White',    'attributes' => ['size' => 'UK 9',  'color' => 'Navy-White']],
                    ['name' => 'UK 10 / Navy-White',   'attributes' => ['size' => 'UK 10', 'color' => 'Navy-White']],
                ],
            ],

            // ── HOME & LIVING ─────────────────────────────────────
            [
                'name'       => 'IKEA POÄNG Armchair',
                'category'   => 'furniture',
                'brand'      => 'IKEA',
                'short_desc' => 'Classic layered bentwood birch frame armchair with cushion, extremely comfortable.',
                'description'=> '<h2>IKEA POÄNG Armchair</h2><p>A timeless design since 1976. The POÄNG armchair is made of layer-glued bent birch that gives flexibility and resilience. The high back provides great support for your neck and back.</p>',
                'price'      => 95000,
                'weight'     => 7.50,
                'featured'   => true,
                'stock'      => 35,
                'tags'       => ['chair', 'furniture', 'ikea', 'armchair', 'living-room'],
                'variants'   => [
                    ['name' => 'Birch / Knisa Light Beige',  'attributes' => ['frame' => 'Birch', 'cushion' => 'Knisa Light Beige']],
                    ['name' => 'Birch / Knisa Dark Grey',    'attributes' => ['frame' => 'Birch', 'cushion' => 'Knisa Dark Grey']],
                    ['name' => 'Black-Brown / Knisa Black',  'attributes' => ['frame' => 'Black-Brown', 'cushion' => 'Knisa Black']],
                ],
            ],
            [
                'name'       => 'Philips Air Fryer HD9252',
                'category'   => 'kitchen-dining',
                'brand'      => 'Philips',
                'short_desc' => '1400W digital air fryer, 4.1L capacity, up to 90% less fat.',
                'description'=> '<h2>Philips Air Fryer HD9252</h2><p>Enjoy crispy, golden food with up to 90% less fat. The patented Rapid Air technology circulates hot air evenly for perfect results every time. The digital display makes it easy to set time and temperature.</p>',
                'price'      => 68000,
                'sale_price' => 58000,
                'weight'     => 3.60,
                'featured'   => true,
                'stock'      => 50,
                'tags'       => ['air-fryer', 'kitchen', 'philips', 'appliance', 'healthy-cooking'],
            ],
            [
                'name'       => 'Scanfrost 7kg Top Load Washing Machine',
                'category'   => 'furniture',
                'brand'      => 'Scanfrost',
                'short_desc' => '7kg capacity, multiple wash programs, energy-saving motor.',
                'description'=> '<h2>Scanfrost 7kg Washing Machine</h2><p>Get your laundry done efficiently with the Scanfrost top-load washer. Multiple wash programs handle everything from delicates to heavy-duty loads, while the energy-saving motor keeps electricity bills low.</p>',
                'price'      => 185000,
                'weight'     => 34.00,
                'stock'      => 20,
                'tags'       => ['washing-machine', 'appliance', 'scanfrost', 'home'],
            ],
            [
                'name'       => 'Ceramic Dinner Set (18 Pieces)',
                'category'   => 'kitchen-dining',
                'brand'      => 'Nexus',
                'short_desc' => '18-piece white ceramic dinner set, microwave and dishwasher safe.',
                'description'=> '<h2>Nexus Ceramic Dinner Set</h2><p>Complete your dining experience with this elegant 18-piece ceramic set. Includes 6 dinner plates, 6 side plates, and 6 bowls. Suitable for everyday use or formal entertaining.</p>',
                'price'      => 35000,
                'sale_price' => 29000,
                'weight'     => 4.50,
                'stock'      => 80,
                'tags'       => ['dinnerware', 'ceramic', 'kitchen', 'home'],
                'variants'   => [
                    ['name' => 'White',       'attributes' => ['color' => 'White']],
                    ['name' => 'Cream',       'attributes' => ['color' => 'Cream']],
                    ['name' => 'Light Blue',  'attributes' => ['color' => 'Light Blue']],
                ],
            ],
            [
                'name'       => 'Philips 40W LED Bulb (Pack of 6)',
                'category'   => 'lighting',
                'brand'      => 'Philips',
                'short_desc' => 'Energy-saving 40W equivalent LED bulbs, warm white, 10,000-hour lifespan.',
                'description'=> '<h2>Philips 40W LED Bulb Pack</h2><p>Switch to LED and save on electricity. These Philips LED bulbs last up to 10,000 hours — 10x longer than incandescent bulbs — while using 85% less energy.</p>',
                'price'      => 5500,
                'weight'     => 0.20,
                'stock'      => 500,
                'tags'       => ['bulb', 'led', 'lighting', 'energy-saving', 'philips'],
            ],
            [
                'name'       => 'Modern Bedside Lamp',
                'category'   => 'lighting',
                'brand'      => 'Nexus',
                'short_desc' => 'Touch-controlled bedside lamp with 3 brightness levels and USB charging port.',
                'description'=> '<h2>Modern Bedside Lamp</h2><p>Upgrade your nighttime routine with this sleek touch-controlled lamp. Three brightness settings and a warm colour temperature create the perfect ambiance for reading or relaxation.</p>',
                'price'      => 18000,
                'stock'      => 100,
                'tags'       => ['lamp', 'lighting', 'bedroom', 'modern'],
                'variants'   => [
                    ['name' => 'White',  'attributes' => ['color' => 'White']],
                    ['name' => 'Black',  'attributes' => ['color' => 'Black']],
                    ['name' => 'Gold',   'attributes' => ['color' => 'Gold']],
                ],
            ],

            // ── HEALTH & BEAUTY ───────────────────────────────────
            [
                'name'       => 'Olay Regenerist Micro-Sculpting Cream',
                'category'   => 'skincare',
                'brand'      => 'Olay',
                'short_desc' => 'Advanced anti-aging moisturiser with Amino-Peptide Complex, 50ml.',
                'description'=> '<h2>Olay Regenerist Micro-Sculpting Cream</h2><p>This award-winning moisturiser works on the surface of skin and below to create a visibly firmer, smoother appearance. Hyaluronic acid plumps and deeply hydrates skin.</p>',
                'price'      => 12500,
                'sale_price' => 10500,
                'weight'     => 0.12,
                'stock'      => 250,
                'tags'       => ['skincare', 'moisturiser', 'anti-aging', 'olay', 'women'],
            ],
            [
                'name'       => 'Neutrogena Hydro Boost Water Gel',
                'category'   => 'skincare',
                'brand'      => 'Neutrogena',
                'short_desc' => 'Oil-free gel moisturiser with hyaluronic acid for 24-hour hydration.',
                'description'=> '<h2>Neutrogena Hydro Boost Water Gel</h2><p>Instantly quench your skin\'s thirst. This lightweight gel formula absorbs quickly without leaving a greasy residue, providing long-lasting hydration throughout the day.</p>',
                'price'      => 9800,
                'weight'     => 0.08,
                'stock'      => 300,
                'tags'       => ['skincare', 'moisturiser', 'hydration', 'neutrogena', 'gel'],
            ],
            [
                'name'       => 'Dove Body Wash - Deep Moisture (500ml)',
                'category'   => 'skincare',
                'brand'      => 'Dove',
                'short_desc' => 'Nourishing body wash with NutriumMoisture technology for silky soft skin.',
                'description'=> '<h2>Dove Deep Moisture Body Wash</h2><p>Go beyond clean. Dove Deep Moisture Body Wash contains NutriumMoisture that nourishes skin as you wash. Leaves your skin feeling soft, smooth, and moisturised.</p>',
                'price'      => 4500,
                'weight'     => 0.55,
                'stock'      => 400,
                'tags'       => ['body-wash', 'dove', 'skincare', 'shower'],
                'variants'   => [
                    ['name' => 'Deep Moisture',    'attributes' => ['variant' => 'Deep Moisture']],
                    ['name' => 'Shea Butter',      'attributes' => ['variant' => 'Shea Butter']],
                    ['name' => 'Cucumber & Green Tea', 'attributes' => ['variant' => 'Cucumber & Green Tea']],
                ],
            ],
            [
                'name'       => 'L\'Oréal Paris Elvive Shampoo',
                'category'   => 'hair-care',
                'brand'      => 'L\'Oréal',
                'short_desc' => 'Extraordinary Oil nourishing shampoo for dry, dull hair, 400ml.',
                'description'=> '<h2>L\'Oréal Elvive Extraordinary Oil Shampoo</h2><p>Inspired by rare flower oils, this luxurious shampoo cleanses and leaves hair feeling silky smooth. Suitable for all hair types, especially dry and dull hair.</p>',
                'price'      => 6500,
                'weight'     => 0.45,
                'stock'      => 350,
                'tags'       => ['shampoo', 'loreal', 'hair-care', 'nourishing'],
            ],

            // ── SPORTS & OUTDOORS ─────────────────────────────────
            [
                'name'       => 'Under Armour UA HOVR Infinite 5',
                'category'   => 'footwear',
                'brand'      => 'Under Armour',
                'short_desc' => 'Connected running shoe with UA HOVR cushioning and real-time coaching.',
                'description'=> '<h2>UA HOVR Infinite 5</h2><p>UA HOVR technology provides zero gravity feel to eliminate impact and return energy. With Map My Run built in, you can record and analyse your runs directly from your shoe.</p>',
                'price'      => 72000,
                'weight'     => 0.30,
                'stock'      => 85,
                'tags'       => ['running', 'shoes', 'under-armour', 'connected', 'sport'],
                'variants'   => [
                    ['name' => 'UK 7 / White',  'attributes' => ['size' => 'UK 7',  'color' => 'White']],
                    ['name' => 'UK 8 / White',  'attributes' => ['size' => 'UK 8',  'color' => 'White']],
                    ['name' => 'UK 9 / Black',  'attributes' => ['size' => 'UK 9',  'color' => 'Black']],
                    ['name' => 'UK 10 / Black', 'attributes' => ['size' => 'UK 10', 'color' => 'Black']],
                ],
            ],
            [
                'name'       => 'Adjustable Dumbbell Set (5–25kg)',
                'category'   => 'fitness-equipment',
                'brand'      => 'Nexus',
                'short_desc' => 'Space-saving adjustable dumbbells replace 15 sets, durable steel construction.',
                'description'=> '<h2>Adjustable Dumbbell Set</h2><p>One set does it all. Quickly adjust from 5kg to 25kg with the dial mechanism. Replaces up to 15 pairs of traditional dumbbells, saving you space and money.</p>',
                'price'      => 148000,
                'sale_price' => 128000,
                'weight'     => 25.00,
                'featured'   => false,
                'stock'      => 30,
                'tags'       => ['dumbbells', 'fitness', 'gym', 'home-gym', 'weights'],
            ],
            [
                'name'       => 'Nike Pro Combat Training Tights',
                'category'   => 'sports-clothing',
                'brand'      => 'Nike',
                'short_desc' => 'Compression training tights with Dri-FIT fabric and flatlock seams.',
                'description'=> '<h2>Nike Pro Combat Training Tights</h2><p>Train with confidence. The Pro Combat tights hug your muscles for support while Dri-FIT technology moves sweat away from your skin. Flatlock seams prevent chafing during intense workouts.</p>',
                'price'      => 28000,
                'weight'     => 0.18,
                'stock'      => 160,
                'tags'       => ['compression', 'tights', 'nike', 'training', 'sport'],
                'variants'   => [
                    ['name' => 'S / Black',  'attributes' => ['size' => 'S',  'color' => 'Black']],
                    ['name' => 'M / Black',  'attributes' => ['size' => 'M',  'color' => 'Black']],
                    ['name' => 'L / Black',  'attributes' => ['size' => 'L',  'color' => 'Black']],
                    ['name' => 'XL / Black', 'attributes' => ['size' => 'XL', 'color' => 'Black']],
                ],
            ],

            // ── BOOKS & STATIONERY ────────────────────────────────
            [
                'name'       => 'Atomic Habits by James Clear',
                'category'   => 'non-fiction',
                'brand'      => 'Nexus',
                'short_desc' => 'Tiny changes, remarkable results. The definitive guide to habit formation.',
                'description'=> '<h2>Atomic Habits</h2><p>No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear distils the most fundamental information about habit formation, making it easy to put into practice.</p>',
                'price'      => 8500,
                'weight'     => 0.32,
                'stock'      => 500,
                'tags'       => ['book', 'self-help', 'habits', 'productivity', 'non-fiction'],
            ],
            [
                'name'       => 'A5 Premium Leather Journal',
                'category'   => 'stationery',
                'brand'      => 'Nexus',
                'short_desc' => 'Handcrafted genuine leather A5 journal with 200 acid-free pages.',
                'description'=> '<h2>Premium Leather Journal</h2><p>For thoughts worth keeping. This handcrafted journal features a genuine leather cover that develops a beautiful patina over time. Acid-free pages prevent yellowing and ensure your writing lasts.</p>',
                'price'      => 12000,
                'weight'     => 0.28,
                'stock'      => 200,
                'tags'       => ['journal', 'stationery', 'leather', 'notebook'],
                'variants'   => [
                    ['name' => 'Dark Brown', 'attributes' => ['color' => 'Dark Brown']],
                    ['name' => 'Black',      'attributes' => ['color' => 'Black']],
                    ['name' => 'Cognac',     'attributes' => ['color' => 'Cognac']],
                ],
            ],
            [
                'name'       => 'Things Fall Apart by Chinua Achebe',
                'category'   => 'fiction',
                'brand'      => 'Nexus',
                'short_desc' => 'The seminal masterpiece of African literature. A must-read classic.',
                'description'=> '<h2>Things Fall Apart</h2><p>Chinua Achebe\'s first novel is the story of Okonkwo, a leader and local wrestling champion in Umuofia—a lower Nigerian clan. A story of tradition and change, of pride and of breaking.</p>',
                'price'      => 5500,
                'weight'     => 0.22,
                'stock'      => 800,
                'tags'       => ['book', 'fiction', 'african-literature', 'classic', 'chinua-achebe'],
            ],

            // ── MORE PRODUCTS for variety ─────────────────────────
            [
                'name'       => 'Itel P55+ Smartphone',
                'category'   => 'smartphones',
                'brand'      => 'Itel',
                'short_desc' => '6.6" display, 5000mAh battery, 50MP AI camera, 4GB RAM.',
                'description'=> '<h2>Itel P55+</h2><p>Powerful performance at an unbeatable price. The P55+ comes with a massive 5000mAh battery that keeps you connected all day, while the 50MP AI camera captures stunning photos.</p>',
                'price'      => 98000,
                'sale_price' => 88000,
                'weight'     => 0.18,
                'stock'      => 200,
                'tags'       => ['smartphone', 'itel', 'budget', 'android'],
            ],
            [
                'name'       => 'Dell XPS 15 Laptop',
                'category'   => 'laptops',
                'brand'      => 'Samsung',
                'short_desc' => '15.6" OLED display, Intel Core i7-13700H, 32GB RAM, RTX 4060.',
                'description'=> '<h2>Dell XPS 15</h2><p>The XPS 15 is a premium 15-inch laptop featuring a stunning OLED display and powerful performance in an ultracompact design. Ideal for creative professionals and power users.</p>',
                'price'      => 2100000,
                'weight'     => 1.86,
                'featured'   => false,
                'stock'      => 15,
                'tags'       => ['laptop', 'dell', 'xps', 'creator', 'rtx'],
            ],
            [
                'name'       => 'Yoga Mat - Non-Slip 6mm',
                'category'   => 'fitness-equipment',
                'brand'      => 'Under Armour',
                'short_desc' => 'High-density TPE yoga mat with alignment lines and carry strap.',
                'description'=> '<h2>Non-Slip Yoga Mat</h2><p>Elevate your practice with superior grip and cushioning. Made from eco-friendly TPE foam with a double-layer non-slip surface to keep you stable in every pose.</p>',
                'price'      => 18500,
                'weight'     => 1.10,
                'stock'      => 180,
                'tags'       => ['yoga', 'fitness', 'mat', 'exercise'],
                'variants'   => [
                    ['name' => 'Purple', 'attributes' => ['color' => 'Purple']],
                    ['name' => 'Blue',   'attributes' => ['color' => 'Blue']],
                    ['name' => 'Black',  'attributes' => ['color' => 'Black']],
                    ['name' => 'Green',  'attributes' => ['color' => 'Green']],
                ],
            ],
            [
                'name'       => 'Sterling Silver Hoop Earrings',
                'category'   => 'jewelry',
                'brand'      => 'Zara',
                'short_desc' => 'Classic 30mm sterling silver hoop earrings with secure click closure.',
                'description'=> '<h2>Sterling Silver Hoop Earrings</h2><p>A timeless jewellery staple. These 30mm hoops are crafted from 925 sterling silver and finished to a high polish for a radiant shine that complements any outfit.</p>',
                'price'      => 14500,
                'sale_price' => 11000,
                'weight'     => 0.02,
                'stock'      => 120,
                'tags'       => ['earrings', 'jewellery', 'silver', 'women', 'accessories'],
            ],
            [
                'name'       => 'Memory Foam Pillow - Ergonomic',
                'category'   => 'bedding-bath',
                'brand'      => 'Nexus',
                'short_desc' => 'Contoured memory foam pillow with cooling gel layer for neck support.',
                'description'=> '<h2>Ergonomic Memory Foam Pillow</h2><p>Wake up feeling refreshed. The contoured design aligns your spine while the cooling gel layer prevents overheating. Hypoallergenic bamboo cover included.</p>',
                'price'      => 25000,
                'weight'     => 0.90,
                'stock'      => 90,
                'tags'       => ['pillow', 'memory-foam', 'bedroom', 'sleep', 'ergonomic'],
            ],
            [
                'name'       => '4K Ultra HD Smart TV 55"',
                'category'   => 'accessories',
                'brand'      => 'Samsung',
                'short_desc' => '55" 4K UHD Smart TV with HDR10+, built-in Alexa, 60Hz refresh rate.',
                'description'=> '<h2>Samsung 55" 4K Smart TV</h2><p>Bring cinema home. Crystal-clear 4K UHD resolution with HDR10+ delivers vibrant colours and deep contrast. Built-in Alexa lets you control your TV and smart home with just your voice.</p>',
                'price'      => 450000,
                'sale_price' => 399000,
                'weight'     => 14.5,
                'featured'   => true,
                'stock'      => 22,
                'tags'       => ['tv', 'smart-tv', 'samsung', '4k', 'home-entertainment'],
            ],
            [
                'name'       => 'Gucci Bamboo Perfume (75ml)',
                'category'   => 'fragrances',
                'brand'      => 'Gucci',
                'short_desc' => 'Elegant woody floral fragrance inspired by the strength and grace of bamboo.',
                'description'=> '<h2>Gucci Bamboo Eau de Parfum</h2><p>A timeless fragrance for the modern woman. Notes of bergamot, Casablanca lily, and sandalwood create a sophisticated, lingering scent perfect for every occasion.</p>',
                'price'      => 95000,
                'weight'     => 0.25,
                'featured'   => false,
                'stock'      => 40,
                'tags'       => ['perfume', 'gucci', 'fragrance', 'luxury', 'women'],
            ],
            [
                'name'       => 'Vitamin C + Zinc Supplement (90 Tablets)',
                'category'   => 'vitamins-supplements',
                'brand'      => 'Dove',
                'short_desc' => 'High-potency Vitamin C 1000mg + Zinc 10mg immune support supplement.',
                'description'=> '<h2>Vitamin C + Zinc</h2><p>Support your immune system daily. Each tablet provides 1000mg of Vitamin C and 10mg of Zinc, antioxidants that help protect cells from oxidative stress and support normal immune function.</p>',
                'price'      => 7500,
                'weight'     => 0.14,
                'stock'      => 600,
                'tags'       => ['vitamins', 'supplement', 'immune', 'health', 'wellness'],
            ],
            [
                'name'       => 'Outdoor Camping Backpack 65L',
                'category'   => 'outdoor-gear',
                'brand'      => 'Under Armour',
                'short_desc' => 'Durable 65L hiking backpack with rain cover, multiple compartments.',
                'description'=> '<h2>65L Camping Backpack</h2><p>Built for adventure. The reinforced base and padded shoulder straps distribute weight evenly on long hikes. Waterproof rain cover included to protect your gear in any weather.</p>',
                'price'      => 55000,
                'sale_price' => 48000,
                'weight'     => 2.10,
                'stock'      => 45,
                'tags'       => ['backpack', 'camping', 'hiking', 'outdoor', 'travel'],
                'variants'   => [
                    ['name' => 'Olive Green', 'attributes' => ['color' => 'Olive Green']],
                    ['name' => 'Navy Blue',   'attributes' => ['color' => 'Navy Blue']],
                    ['name' => 'Black',       'attributes' => ['color' => 'Black']],
                ],
            ],
            [
                'name'       => 'Rich Dad Poor Dad by Robert Kiyosaki',
                'category'   => 'non-fiction',
                'brand'      => 'Nexus',
                'short_desc' => 'What the rich teach their kids about money that the poor and middle class do not.',
                'description'=> '<h2>Rich Dad Poor Dad</h2><p>Robert Kiyosaki\'s bestselling classic challenges the myth that you need a high income to become rich. It reveals the rich don\'t work for money — their money works for them.</p>',
                'price'      => 7800,
                'weight'     => 0.28,
                'stock'      => 450,
                'tags'       => ['book', 'finance', 'investment', 'non-fiction', 'bestseller'],
            ],
        ];
    }
}