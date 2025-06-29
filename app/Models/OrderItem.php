<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'mug_id',
        'original_image_path',
        'generated_image_path',
        'quantity',
        'price',
        'customization_data',
    ];

    protected $casts = [
        'customization_data' => 'array',
        'price' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function mug(): BelongsTo
    {
        return $this->belongsTo(Mug::class);
    }

    public function getSubtotalAttribute(): float
    {
        return $this->price * $this->quantity;
    }
}
