<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeSubscriberMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly string $couponCode) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome! Here\'s your 10% discount code 🎉');
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.newsletter.welcome',
            with: ['couponCode' => $this->couponCode],
        );
    }
}