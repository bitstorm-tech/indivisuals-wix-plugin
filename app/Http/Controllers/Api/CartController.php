<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index(): JsonResponse
    {
        $cart = $this->cartService->getCart();
        $cart->load(['items.mug', 'items.prompt']);

        return response()->json([
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'mug' => [
                            'id' => $item->mug->id,
                            'name' => $item->mug->name,
                            'image' => $item->mug->image,
                        ],
                        'generated_image_path' => $item->generated_image_path,
                        'original_image_path' => $item->original_image_path,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->price,
                        'subtotal' => (float) $item->subtotal,
                        'prompt' => $item->prompt ? [
                            'id' => $item->prompt->id,
                            'text' => $item->prompt->text,
                        ] : null,
                    ];
                }),
                'subtotal' => (float) $cart->subtotal,
                'total_items' => $cart->total_items,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mug_id' => 'required|exists:mugs,id',
            'generated_image_path' => 'required|string',
            'original_image_path' => 'nullable|string',
            'crop_data' => 'nullable|array',
            'prompt_id' => 'nullable|exists:prompts,id',
            'quantity' => 'nullable|integer|min:1',
            'customization_data' => 'nullable|array',
        ]);

        $item = $this->cartService->addItem($validated);
        $item->load(['mug', 'prompt']);

        return response()->json([
            'message' => 'Item added to cart',
            'item' => [
                'id' => $item->id,
                'mug' => [
                    'id' => $item->mug->id,
                    'name' => $item->mug->name,
                    'image' => $item->mug->image,
                ],
                'generated_image_path' => $item->generated_image_path,
                'original_image_path' => $item->original_image_path,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => (float) $item->subtotal,
                'prompt' => $item->prompt ? [
                    'id' => $item->prompt->id,
                    'text' => $item->prompt->text,
                ] : null,
            ],
            'cart_total_items' => $this->cartService->getItemCount(),
            'cart_subtotal' => (float) $this->cartService->getSubtotal(),
        ], 201);
    }

    public function update(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $item = $this->cartService->updateItemQuantity($itemId, $validated['quantity']);

        if (! $item && $validated['quantity'] > 0) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        if ($validated['quantity'] === 0) {
            return response()->json([
                'message' => 'Item removed from cart',
                'cart_total_items' => $this->cartService->getItemCount(),
                'cart_subtotal' => (float) $this->cartService->getSubtotal(),
            ]);
        }

        $item->load(['mug', 'prompt']);

        return response()->json([
            'message' => 'Cart item updated',
            'item' => [
                'id' => $item->id,
                'mug' => [
                    'id' => $item->mug->id,
                    'name' => $item->mug->name,
                    'image' => $item->mug->image,
                ],
                'generated_image_path' => $item->generated_image_path,
                'original_image_path' => $item->original_image_path,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => (float) $item->subtotal,
                'prompt' => $item->prompt ? [
                    'id' => $item->prompt->id,
                    'text' => $item->prompt->text,
                ] : null,
            ],
            'cart_total_items' => $this->cartService->getItemCount(),
            'cart_subtotal' => (float) $this->cartService->getSubtotal(),
        ]);
    }

    public function destroy(int $itemId): JsonResponse
    {
        $removed = $this->cartService->removeItem($itemId);

        if (! $removed) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        return response()->json([
            'message' => 'Item removed from cart',
            'cart_total_items' => $this->cartService->getItemCount(),
            'cart_subtotal' => (float) $this->cartService->getSubtotal(),
        ]);
    }

    public function clear(): JsonResponse
    {
        $this->cartService->clearCart();

        return response()->json([
            'message' => 'Cart cleared',
            'cart_total_items' => 0,
            'cart_subtotal' => 0,
        ]);
    }
}
