<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
        $this->middleware('auth');
    }

    public function index(): JsonResponse
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['items.mug'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'shipping_address' => 'required|array',
            'shipping_address.line1' => 'required|string|max:255',
            'shipping_address.line2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required|string|max:255',
            'shipping_address.state' => 'required|string|max:255',
            'shipping_address.postal_code' => 'required|string|max:20',
            'shipping_address.country' => 'required|string|max:2',
            'billing_address' => 'nullable|array',
            'billing_address.line1' => 'nullable|required_with:billing_address|string|max:255',
            'billing_address.line2' => 'nullable|string|max:255',
            'billing_address.city' => 'nullable|required_with:billing_address|string|max:255',
            'billing_address.state' => 'nullable|required_with:billing_address|string|max:255',
            'billing_address.postal_code' => 'nullable|required_with:billing_address|string|max:20',
            'billing_address.country' => 'nullable|required_with:billing_address|string|max:2',
            'shipping' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
        ]);

        $cart = $this->cartService->getCart();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        DB::beginTransaction();
        try {
            $order = new Order;
            $order = $order->createFromCart($cart, $validated);

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'total' => $order->total,
                    'created_at' => $order->created_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Failed to create order'], 500);
        }
    }

    public function show(Order $order): JsonResponse
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->load(['items.mug']);

        return response()->json([
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'email' => $order->email,
                'full_name' => $order->full_name,
                'phone' => $order->phone,
                'subtotal' => $order->subtotal,
                'shipping' => $order->shipping,
                'tax' => $order->tax,
                'total' => $order->total,
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'created_at' => $order->created_at,
                'items' => $order->items->map(function ($item) {
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
                        'price' => $item->price,
                        'subtotal' => $item->subtotal,
                    ];
                }),
            ],
        ]);
    }
}
