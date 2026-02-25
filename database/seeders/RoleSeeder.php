<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles & permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Products
            'view products', 'create products', 'edit products', 'delete products',
            // Orders
            'view orders', 'manage orders', 'cancel orders',
            // Customers
            'view customers', 'manage customers',
            // Categories & Brands
            'manage categories', 'manage brands',
            // Coupons
            'manage coupons',
            // Reports
            'view reports',
            // Settings
            'manage settings',
            // Vendors
            'manage vendors',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->givePermissionTo(Permission::all());

        $vendor = Role::firstOrCreate(['name' => 'Vendor']);
        $vendor->givePermissionTo([
            'view products', 'create products', 'edit products',
            'view orders', 'cancel orders',
        ]);

        Role::firstOrCreate(['name' => 'Customer']);
    }
}