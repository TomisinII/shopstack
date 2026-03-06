<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeSubscriberMail;
use App\Models\Coupon;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): RedirectResponse
    {
        $request->validate(['email' => 'required|email|max:255']);

        // Silent success if already subscribed — don't expose whether email exists
        if (NewsletterSubscriber::where('email', $request->email)->exists()) {
            return back()->with('newsletter_success', true);
        }

        $coupon = Coupon::where('code', 'WELCOME10')
            ->where('is_active', true)
            ->first();

        NewsletterSubscriber::create([
            'email'       => $request->email,
            'coupon_code' => $coupon?->code,
        ]);

        Mail::to($request->email)->queue(new WelcomeSubscriberMail($coupon?->code ?? 'WELCOME10'));

        return back()->with('newsletter_success', true);
    }
}