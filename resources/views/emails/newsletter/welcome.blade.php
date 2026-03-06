<x-mail::message>
# Welcome to ShopStack! 🛍️

Thanks for subscribing. As promised, here's your exclusive discount code:

<x-mail::panel>
# {{ $couponCode }}
</x-mail::panel>

Use it at checkout to get **10% off** your first order.

<x-mail::button :url="config('app.url') . '/shop'" color="primary">
Start Shopping
</x-mail::button>

This code is valid for one use only. Happy shopping!

Thanks,
{{ config('app.name') }}
</x-mail::message>