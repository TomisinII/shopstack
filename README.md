# ShopStack

A modern, full-featured e-commerce platform built with **Laravel 11**, **React 18**, and **Inertia.js** — designed for small to medium businesses that need a self-hosted, customizable online store with multi-vendor support.

---

## 📸 Screenshots

| Storefront | Admin Dashboard | Vendor Panel |
|---|---|---|
| ![Storefront](screenshots/storefront.png) | ![Admin](screenshots/admin.png) | ![Vendor](screenshots/vendor.png) |

---

## ✨ Features

### Customer-Facing Storefront
- Product catalog with grid layout, filtering, sorting, and search
- Product detail pages with image galleries, variant selectors, and reviews
- Shopping cart with coupon/discount code support
- Multi-step checkout flow (shipping → shipping method → payment)
- Guest checkout with optional account creation
- Order tracking and confirmation emails
- Wishlist with move-to-cart functionality

### Customer Account
- Dashboard with order history and stats
- Address book management
- Review and rating submission (verified purchases)
- Profile and notification preference settings

### Admin Dashboard
- Sales overview with revenue charts and order stats
- Full product CRUD — images, variants, tags, SEO, inventory tracking
- Category and brand management (hierarchical categories supported)
- Order management with status updates, tracking numbers, and invoice download
- Customer management with lifetime value tracking
- Coupon/discount code system (percentage, fixed, free shipping)
- Reports: sales, products, customers, vendors, tax, coupons
- Platform-wide settings (general, email, payment, shipping, tax, SEO)

### Multi-Vendor Marketplace
- Vendor registration and admin approval workflow
- Vendor dashboard with earnings, commission tracking, and payout requests
- Vendors manage their own products and see only their relevant orders
- Configurable commission rates per vendor

### Technical Highlights
- Role-based access control (Admin, Vendor, Customer) via Spatie Permission
- Stripe and Paystack payment integration
- Queued email notifications (order confirmed, shipped, delivered, low stock, etc.)
- Soft deletes, eager loading, and full-text search on products
- Optimistic UI updates and loading skeletons
- Mobile-first responsive design with dark mode support
- PDF invoice generation via DomPDF

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11.x |
| Frontend | React 18.x + TypeScript |
| Routing | Inertia.js 1.x |
| Styling | Tailwind CSS 3.x |
| Auth | Laravel Breeze + Spatie Permission |
| Payments | Stripe API, Paystack API |
| Database | MySQL 8.0+ |
| Storage | Local (dev) / AWS S3 (prod) |
| Queue | Laravel Horizon (Redis) |
| PDF | barryvdh/laravel-dompdf |
| Icons | Heroicons |

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+ and npm
- MySQL 8.0+
- Redis (for queues)

### Installation

```bash
# Clone the repository
git clone https://github.com/TomisinII/shopstack.git
cd shopstack

# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy environment file and configure
cp .env.example .env
php artisan key:generate
```

### Environment Configuration

Update `.env` with your credentials:

```env
# Database
DB_DATABASE=shopstack
DB_USERNAME=root
DB_PASSWORD=

# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=

# AWS S3 (production)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
```

### Database Setup

```bash
# Run migrations
php artisan migrate

# Seed with demo data
php artisan db:seed
```

### Build & Run

```bash
# Development
npm run dev
php artisan serve

# Queue worker
php artisan horizon

# Production build
npm run build
php artisan optimize
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopstack.com | Admin123! |
| Vendor | vendor@shopstack.com | Vendor123! |
| Customer | customer@shopstack.com | Customer123! |

> Stripe test mode is enabled. Use card `4242 4242 4242 4242` with any future expiry and CVC.

---

## 🗄 Database Schema

The schema covers 18+ tables including:

`users` · `profiles` · `products` · `product_images` · `product_variants` · `categories` · `brands` · `tags` · `orders` · `order_items` · `carts` · `cart_items` · `wishlists` · `reviews` · `coupons` · `coupon_usages` · `transactions` · `addresses` · `notifications` · `settings`

Key design decisions:
- Soft deletes on products to preserve order history integrity
- Snapshot fields on `order_items` (product name, SKU, price) to freeze data at time of purchase
- JSON `attributes` column on variants for flexible size/color/material options
- Hierarchical categories via self-referential `parent_id`

> See [`/database/migrations`](database/migrations) for the full schema.

---

## 📁 Project Structure

```
app/
├── Http/Controllers/
│   ├── Admin/          # Product, Order, Customer, Coupon, Report, Settings
│   ├── Vendor/         # Dashboard, Products, Orders, Earnings, Settings
│   └── Customer/       # Dashboard, Orders, Wishlist, Addresses, Profile
├── Models/             # Eloquent models with scopes and helpers
├── Policies/           # Authorization policies
└── Jobs/               # Queued jobs (emails, inventory, order processing)

resources/js/
├── Pages/
│   ├── Admin/          # Dashboard, Products, Orders, Customers, Coupons, Reports
│   ├── Vendor/         # Dashboard, Products, Orders, Earnings
│   ├── Account/        # Customer dashboard, orders, wishlist, addresses
│   ├── Shop/           # Product listing and detail pages
│   └── Checkout/       # Checkout flow and confirmation
├── Components/         # Reusable UI components (Button, Badge, Modal, etc.)
└── Layouts/            # AppLayout, AdminLayout, VendorLayout
```

---

## 🔑 User Roles & Permissions

| Permission | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Manage all products | ✅ | ❌ | ❌ |
| Manage own products | ✅ | ✅ | ❌ |
| View all orders | ✅ | ❌ | ❌ |
| View own orders | ✅ | ✅ | ✅ |
| Approve vendors | ✅ | ❌ | ❌ |
| Manage coupons | ✅ | ❌ | ❌ |
| View reports | ✅ | Partial | ❌ |
| Request payouts | ❌ | ✅ | ❌ |

---

## 🚢 Deployment Checklist

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Run `php artisan migrate --force`
- [ ] Configure AWS S3 for image storage
- [ ] Set live Stripe/Paystack API keys
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure queue worker with Laravel Horizon
- [ ] Run `npm run build` and `php artisan optimize`
- [ ] Set up automated database backups
- [ ] Configure Cloudflare CDN for static assets

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

---

## 👤 Author

Built by **[Olutomisin Oluwajuwon]** as a portfolio project demonstrating full-stack Laravel + React development with real-world e-commerce patterns.

- GitHub: [@TomisinII](https://github.com/TomisinII)
- Portfolio: [juwonolutomisin.vercel.com](https://yourwebsite.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://www.linkedin.com/in/olutomisinoluwajuwon/)