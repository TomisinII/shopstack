<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Roles
        $adminRole = Role::create(['name' => 'Admin']);
        $vendorRole = Role::create(['name' => 'Vendor']);
        $customerRole = Role::create(['name' => 'Customer']);

        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@shopstack.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('Admin');

        // Create Vendor User
        $vendor = User::create([
            'name' => 'Vendor User',
            'email' => 'vendor@shopstack.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $vendor->assignRole('Vendor');

        // Create Customer User
        $customer = User::create([
            'name' => 'John Doe',
            'email' => 'customer@shopstack.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $customer->assignRole('Customer');

        // Create Categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic devices and gadgets',
            'is_featured' => true,
        ]);

        $computers = Category::create([
            'name' => 'Computers',
            'slug' => 'computers',
            'description' => 'Laptops, desktops, and accessories',
            'parent_id' => $electronics->id,
        ]);

        $phones = Category::create([
            'name' => 'Phones',
            'slug' => 'phones',
            'description' => 'Smartphones and mobile devices',
            'parent_id' => $electronics->id,
        ]);

        $fashion = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'description' => 'Clothing and accessories',
            'is_featured' => true,
        ]);

        $mensClothing = Category::create([
            'name' => "Men's Clothing",
            'slug' => 'mens-clothing',
            'description' => 'Clothing for men',
            'parent_id' => $fashion->id,
        ]);

        // Create Brands
        $apple = Brand::create([
            'name' => 'Apple',
            'slug' => 'apple',
            'description' => 'Premium technology products',
        ]);

        $samsung = Brand::create([
            'name' => 'Samsung',
            'slug' => 'samsung',
            'description' => 'Electronics and mobile devices',
        ]);

        $nike = Brand::create([
            'name' => 'Nike',
            'slug' => 'nike',
            'description' => 'Athletic wear and footwear',
        ]);

        // Create Sample Products
        $product1 = Product::create([
            'user_id' => $vendor->id,
            'category_id' => $computers->id,
            'brand_id' => $apple->id,
            'name' => 'MacBook Pro 16" M3',
            'slug' => 'macbook-pro-16-m3',
            'sku' => 'APPLE-MBP16-M3',
            'short_description' => 'Powerful laptop for professionals',
            'description' => 'The MacBook Pro 16" with M3 chip delivers exceptional performance for creative professionals. Features a stunning Retina display, incredible battery life, and advanced thermal architecture.',
            'price' => 2499.00,
            'sale_price' => 2299.00,
            'stock_quantity' => 15,
            'is_featured' => true,
            'status' => 'published',
        ]);

        $product2 = Product::create([
            'user_id' => $vendor->id,
            'category_id' => $phones->id,
            'brand_id' => $samsung->id,
            'name' => 'Samsung Galaxy S24 Ultra',
            'slug' => 'samsung-galaxy-s24-ultra',
            'sku' => 'SAMSUNG-S24U',
            'short_description' => 'Ultimate flagship smartphone',
            'description' => 'Experience the pinnacle of mobile technology with the Galaxy S24 Ultra. Features a 200MP camera, S Pen, and all-day battery life.',
            'price' => 1199.00,
            'stock_quantity' => 30,
            'is_featured' => true,
            'status' => 'published',
        ]);

        $product3 = Product::create([
            'user_id' => $vendor->id,
            'category_id' => $mensClothing->id,
            'brand_id' => $nike->id,
            'name' => 'Nike Air Max 2024',
            'slug' => 'nike-air-max-2024',
            'sku' => 'NIKE-AM2024',
            'short_description' => 'Iconic sneakers with modern comfort',
            'description' => 'The Nike Air Max 2024 combines classic style with cutting-edge comfort technology. Perfect for everyday wear.',
            'price' => 159.99,
            'sale_price' => 129.99,
            'stock_quantity' => 50,
            'stock_status' => 'in_stock',
            'status' => 'published',
        ]);

        // Create more sample products
        for ($i = 4; $i <= 20; $i++) {
            Product::create([
                'user_id' => $vendor->id,
                'category_id' => [$electronics->id, $computers->id, $phones->id, $fashion->id][rand(0, 3)],
                'brand_id' => [$apple->id, $samsung->id, $nike->id][rand(0, 2)],
                'name' => "Sample Product $i",
                'slug' => "sample-product-$i",
                'sku' => "SKU-$i",
                'short_description' => "Short description for product $i",
                'description' => "Full description for product $i. This is a great product with many features.",
                'price' => rand(50, 1000),
                'stock_quantity' => rand(0, 100),
                'status' => 'published',
            ]);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin: admin@shopstack.com / password');
        $this->command->info('Vendor: vendor@shopstack.com / password');
        $this->command->info('Customer: customer@shopstack.com / password');
    }
}