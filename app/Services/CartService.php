<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Mug;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CartService
{
    protected ?Cart $cart = null;

    public function getCart(): Cart
    {
        if ($this->cart) {
            return $this->cart;
        }

        if (Auth::check()) {
            $this->cart = Cart::getOrCreateForUser(Auth::id());

            $sessionId = Session::getId();
            if ($sessionId) {
                $this->cart->mergeWithSessionCart($sessionId);
            }
        } else {
            $sessionId = Session::getId();
            if (! $sessionId) {
                Session::start();
                $sessionId = Session::getId();
            }
            $this->cart = Cart::getOrCreateForSession($sessionId);
        }

        return $this->cart;
    }

    public function addItem(array $itemData): CartItem
    {
        $cart = $this->getCart();

        $existingItem = $cart->items()
            ->where('mug_id', $itemData['mug_id'])
            ->where('generated_image_path', $itemData['generated_image_path'])
            ->first();

        if ($existingItem) {
            $existingItem->incrementQuantity($itemData['quantity'] ?? 1);

            return $existingItem;
        }

        $mug = Mug::findOrFail($itemData['mug_id']);

        return $cart->items()->create([
            'mug_id' => $mug->id,
            'original_image_path' => $itemData['original_image_path'] ?? null,
            'generated_image_path' => $itemData['generated_image_path'],
            'crop_data' => $itemData['crop_data'] ?? null,
            'prompt_id' => $itemData['prompt_id'] ?? null,
            'quantity' => $itemData['quantity'] ?? 1,
            'price' => $mug->price,
            'customization_data' => $itemData['customization_data'] ?? null,
        ]);
    }

    public function updateItemQuantity(int $itemId, int $quantity): ?CartItem
    {
        $cart = $this->getCart();
        $item = $cart->items()->find($itemId);

        if (! $item) {
            return null;
        }

        if ($quantity <= 0) {
            $item->delete();

            return null;
        }

        $item->update(['quantity' => $quantity]);

        return $item;
    }

    public function removeItem(int $itemId): bool
    {
        $cart = $this->getCart();
        $item = $cart->items()->find($itemId);

        if (! $item) {
            return false;
        }

        return $item->delete();
    }

    public function clearCart(): void
    {
        $cart = $this->getCart();
        $cart->items()->delete();
    }

    public function getItemCount(): int
    {
        return $this->getCart()->total_items;
    }

    public function getSubtotal(): float
    {
        return $this->getCart()->subtotal;
    }

    public function transferSessionCartToUser(int $userId): void
    {
        $sessionId = Session::getId();
        if (! $sessionId) {
            return;
        }

        $sessionCart = Cart::getForSession($sessionId);
        if (! $sessionCart) {
            return;
        }

        $userCart = Cart::getOrCreateForUser($userId);
        $userCart->mergeWithSessionCart($sessionId);

        $this->cart = $userCart;
    }
}
