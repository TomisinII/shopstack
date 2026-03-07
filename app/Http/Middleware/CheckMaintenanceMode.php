<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        // Cache for 60s to avoid a DB hit on every request
        $isDown = Cache::remember('maintenance_mode', 60, fn () =>
            Setting::get('maintenance_mode', '0') === '1'
        );

        if ($isDown && !$this->isExempt($request)) {
            return Inertia::render('Maintenance')
                ->toResponse($request)
                ->setStatusCode(503);
        }

        return $next($request);
    }

    private function isExempt(Request $request): bool
    {
        // Admin routes and auth routes are always accessible
        return $request->is('admin/*') || $request->is('login') || $request->is('logout');
    }
}