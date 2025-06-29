<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'email',
        'first_name',
        'last_name',
        'phone',
        'status',
        'subtotal',
        'shipping',
        'tax',
        'total',
        'shipping_address',
        'billing_address',
        'payment_method',
        'payment_details',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'payment_details' => 'array',
        'subtotal' => 'decimal:2',
        'shipping' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber(): string
    {
        do {
            $number = 'ORD-'.strtoupper(Str::random(8));
        } while (self::where('order_number', $number)->exists());

        return $number;
    }

    public function createFromCart(Cart $cart, array $orderData): self
    {
        $subtotal = $cart->subtotal;
        $shipping = $orderData['shipping'] ?? 0;
        $tax = $orderData['tax'] ?? 0;
        $total = $subtotal + $shipping + $tax;

        $this->fill([
            'user_id' => $cart->user_id ?? auth()->id(),
            'email' => $orderData['email'],
            'first_name' => $orderData['first_name'],
            'last_name' => $orderData['last_name'],
            'phone' => $orderData['phone'] ?? null,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
            'shipping_address' => $orderData['shipping_address'],
            'billing_address' => $orderData['billing_address'] ?? $orderData['shipping_address'],
        ]);

        $this->save();

        foreach ($cart->items as $cartItem) {
            $this->items()->create([
                'mug_id' => $cartItem->mug_id,
                'original_image_path' => $cartItem->original_image_path,
                'generated_image_path' => $cartItem->generated_image_path,
                'quantity' => $cartItem->quantity,
                'price' => $cartItem->price,
                'customization_data' => $cartItem->customization_data,
            ]);
        }

        $cart->items()->delete();
        $cart->delete();

        return $this;
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }
}
