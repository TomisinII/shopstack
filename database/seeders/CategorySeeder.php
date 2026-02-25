<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Electronics',
                'description' => 'Gadgets, devices, and all things electronic.',
                'is_featured' => true,
                'sort_order'  => 1,
                'children'    => [
                    ['name' => 'Smartphones',      'sort_order' => 1],
                    ['name' => 'Laptops',          'sort_order' => 2],
                    ['name' => 'Tablets',          'sort_order' => 3],
                    ['name' => 'Audio & Headphones','sort_order' => 4],
                    ['name' => 'Smart Watches',    'sort_order' => 5],
                    ['name' => 'Accessories',      'sort_order' => 6],
                ],
            ],
            [
                'name'        => 'Fashion',
                'description' => 'Clothing, footwear, and accessories for every style.',
                'is_featured' => true,
                'sort_order'  => 2,
                'children'    => [
                    ['name' => 'Men\'s Clothing',  'sort_order' => 1],
                    ['name' => 'Women\'s Clothing','sort_order' => 2],
                    ['name' => 'Footwear',         'sort_order' => 3],
                    ['name' => 'Bags & Wallets',   'sort_order' => 4],
                    ['name' => 'Jewelry',          'sort_order' => 5],
                ],
            ],
            [
                'name'        => 'Home & Living',
                'description' => 'Furniture, décor, and everything for your home.',
                'is_featured' => true,
                'sort_order'  => 3,
                'children'    => [
                    ['name' => 'Furniture',        'sort_order' => 1],
                    ['name' => 'Kitchen & Dining', 'sort_order' => 2],
                    ['name' => 'Bedding & Bath',   'sort_order' => 3],
                    ['name' => 'Home Décor',       'sort_order' => 4],
                    ['name' => 'Lighting',         'sort_order' => 5],
                ],
            ],
            [
                'name'        => 'Health & Beauty',
                'description' => 'Skincare, wellness, and personal care products.',
                'is_featured' => false,
                'sort_order'  => 4,
                'children'    => [
                    ['name' => 'Skincare',         'sort_order' => 1],
                    ['name' => 'Hair Care',        'sort_order' => 2],
                    ['name' => 'Fragrances',       'sort_order' => 3],
                    ['name' => 'Vitamins & Supplements', 'sort_order' => 4],
                ],
            ],
            [
                'name'        => 'Sports & Outdoors',
                'description' => 'Gear and equipment for every active lifestyle.',
                'is_featured' => false,
                'sort_order'  => 5,
                'children'    => [
                    ['name' => 'Fitness Equipment','sort_order' => 1],
                    ['name' => 'Sports Clothing',  'sort_order' => 2],
                    ['name' => 'Outdoor Gear',     'sort_order' => 3],
                ],
            ],
            [
                'name'        => 'Books & Stationery',
                'description' => 'Books, office supplies, and educational materials.',
                'is_featured' => false,
                'sort_order'  => 6,
                'children'    => [
                    ['name' => 'Fiction',          'sort_order' => 1],
                    ['name' => 'Non-Fiction',      'sort_order' => 2],
                    ['name' => 'Stationery',       'sort_order' => 3],
                ],
            ],
        ];

        foreach ($categories as $data) {
            $children = $data['children'] ?? [];
            unset($data['children']);

            $parent = Category::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                array_merge($data, [
                    'slug'             => Str::slug($data['name']),
                    'meta_title'       => $data['name'] . ' | ShopStack',
                    'meta_description' => $data['description'],
                ])
            );

            foreach ($children as $child) {
                Category::firstOrCreate(
                    ['slug' => Str::slug($child['name'])],
                    [
                        'name'        => $child['name'],
                        'slug'        => Str::slug($child['name']),
                        'parent_id'   => $parent->id,
                        'is_featured' => false,
                        'sort_order'  => $child['sort_order'],
                        'meta_title'  => $child['name'] . ' | ShopStack',
                    ]
                );
            }
        }
    }
}