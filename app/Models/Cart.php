<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    public static function getForSession(string $sessionId): ?self
    {
        return self::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->first();
    }

    public static function getForUser(int $userId): ?self
    {
        return self::where('user_id', $userId)->first();
    }

    public static function getOrCreateForSession(string $sessionId): self
    {
        return self::firstOrCreate(['session_id' => $sessionId]);
    }

    public static function getOrCreateForUser(int $userId): self
    {
        return self::firstOrCreate(['user_id' => $userId]);
    }

    public function mergeWithSessionCart(string $sessionId): void
    {
        $sessionCart = self::getForSession($sessionId);

        if ($sessionCart && $sessionCart->id !== $this->id) {
            foreach ($sessionCart->items as $item) {
                $existingItem = $this->items()
                    ->where('mug_id', $item->mug_id)
                    ->where('generated_image_path', $item->generated_image_path)
                    ->first();

                if ($existingItem) {
                    $existingItem->update([
                        'quantity' => $existingItem->quantity + $item->quantity,
                    ]);
                } else {
                    $item->update(['cart_id' => $this->id]);
                }
            }

            $sessionCart->delete();
        }
    }
}
