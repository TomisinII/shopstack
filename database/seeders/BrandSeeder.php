<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            // Electronics
            ['name' => 'Samsung',     'description' => 'Global leader in consumer electronics and semiconductors.'],
            ['name' => 'Apple',       'description' => 'Innovating the intersection of technology and humanity.'],
            ['name' => 'Sony',        'description' => 'Premium audio, visual, and entertainment products.'],
            ['name' => 'Tecno',       'description' => 'Affordable smartphones and electronics built for Africa.'],
            ['name' => 'Itel',        'description' => 'Budget-friendly devices for everyday use.'],
            ['name' => 'Infinix',     'description' => 'Bold style meets powerful performance.'],
            ['name' => 'JBL',         'description' => 'Professional-grade audio products for everyone.'],
            ['name' => 'Anker',       'description' => 'Trusted charging and audio accessories worldwide.'],

            // Fashion
            ['name' => 'Zara',        'description' => 'Contemporary fashion for every wardrobe.'],
            ['name' => 'Nike',        'description' => 'Empowering athletes with premium sportswear.'],
            ['name' => 'Adidas',      'description' => 'Sport and style united in every product.'],
            ['name' => 'H&M',         'description' => 'Affordable and sustainable fashion.'],
            ['name' => 'Gucci',       'description' => 'Italian luxury craftsmanship since 1921.'],
            ['name' => 'Konga Fashion', 'description' => 'Local fashion for the discerning Nigerian.'],

            // Home & Living
            ['name' => 'IKEA',        'description' => 'Flat-pack furniture and home solutions.'],
            ['name' => 'Philips',     'description' => 'Lighting, healthcare, and home appliances.'],
            ['name' => 'Scanfrost',   'description' => 'Trusted home appliances across West Africa.'],
            ['name' => 'Nexus',       'description' => 'Reliable kitchen and home equipment.'],

            // Health & Beauty
            ['name' => 'Olay',        'description' => 'Science-backed skincare for radiant skin.'],
            ['name' => 'Neutrogena',  'description' => 'Dermatologist-recommended skincare solutions.'],
            ['name' => 'Dove',        'description' => 'Gentle care for skin and hair.'],
            ['name' => 'L\'Oréal',   'description' => 'Beauty for all, worth it.'],

            // Sports
            ['name' => 'Under Armour','description' => 'Performance apparel and footwear.'],
            ['name' => 'Puma',        'description' => 'Sport lifestyle products and accessories.'],
        ];

        foreach ($brands as $data) {
            Brand::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name'        => $data['name'],
                    'slug'        => Str::slug($data['name']),
                    'description' => $data['description'],
                    'is_active'   => true,
                ]
            );
        }
    }
}