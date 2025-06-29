<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'mug_id',
        'original_image_path',
        'generated_image_path',
        'crop_data',
        'prompt_id',
        'quantity',
        'price',
        'customization_data',
    ];

    protected $casts = [
        'crop_data' => 'array',
        'customization_data' => 'array',
        'price' => 'decimal:2',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function mug(): BelongsTo
    {
        return $this->belongsTo(Mug::class);
    }

    public function prompt(): BelongsTo
    {
        return $this->belongsTo(Prompt::class);
    }

    public function getSubtotalAttribute(): float
    {
        return $this->price * $this->quantity;
    }

    public function incrementQuantity(int $amount = 1): void
    {
        $this->update(['quantity' => $this->quantity + $amount]);
    }

    public function decrementQuantity(int $amount = 1): void
    {
        $newQuantity = max(1, $this->quantity - $amount);
        $this->update(['quantity' => $newQuantity]);
    }
}
