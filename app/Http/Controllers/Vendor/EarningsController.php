<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EarningsController extends Controller
{
    public function index(): Response
    {
        $vendorId = auth()->id();

        // Aggregate stats from completed earning transactions
        $stats = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->selectRaw('
                COALESCE(SUM(amount), 0)            AS total_earnings,
                COALESCE(SUM(commission_amount), 0) AS total_commission
            ')
            ->first();

        $pendingPayout = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'earning')
            ->where('status', 'pending')
            ->sum('net_amount');

        $lastPayout = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'payout')
            ->where('status', 'completed')
            ->latest()
            ->value('net_amount') ?? 0;

        // Monthly breakdown — last 6 months
        $monthlyBreakdown = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("
                DATE_FORMAT(created_at, '%Y-%m') AS month_key,
                DATE_FORMAT(created_at, '%b %Y')  AS month_label,
                COALESCE(SUM(amount), 0)            AS revenue,
                COUNT(*)                            AS orders,
                COALESCE(SUM(commission_amount), 0) AS commission
            ")
            ->groupBy('month_key', 'month_label')
            ->orderByDesc('month_key')
            ->get()
            ->map(fn($row) => [
                'month'      => $row->month_label,
                'revenue'    => (float) $row->revenue,
                'orders'     => (int) $row->orders,
                'commission' => (float) $row->commission,
            ]);

        // Payout history
        $payoutHistory = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'payout')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($t) => [
                'id'          => 'PAY-' . str_pad($t->id, 3, '0', STR_PAD_LEFT),
                'amount'      => (float) $t->net_amount,
                'date'        => $t->created_at->format('Y-m-d'),
                'status'      => $t->status,
                'description' => $t->description ?? 'Bank Transfer',
            ]);

        return Inertia::render('Vendor/Earnings/Index', [
            'stats' => [
                'total_earnings'   => (float) $stats->total_earnings,
                'total_commission' => (float) $stats->total_commission,
                'pending_payout'   => (float) $pendingPayout,
                'last_payout'      => (float) $lastPayout,
            ],
            'monthly_breakdown' => $monthlyBreakdown,
            'payout_history'    => $payoutHistory,
        ]);
    }

    public function requestPayout(Request $request): RedirectResponse
    {
        $vendorId = auth()->id();

        $available = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'earning')
            ->where('status', 'pending')
            ->sum('net_amount');

        if ($available < 1000) {
            return back()->with('error', 'Minimum payout amount is ₦1,000.');
        }

        // Create payout transaction
        Transaction::create([
            'vendor_id'         => $vendorId,
            'type'              => 'payout',
            'amount'            => $available,
            'commission_amount' => 0,
            'net_amount'        => $available,
            'status'            => 'pending',
            'description'       => 'Payout request',
        ]);

        // Mark earnings as paid out
        Transaction::where('vendor_id', $vendorId)
            ->where('type', 'earning')
            ->where('status', 'pending')
            ->update(['status' => 'completed']);

        return back()->with('success', 'Payout request submitted successfully.');
    }
}