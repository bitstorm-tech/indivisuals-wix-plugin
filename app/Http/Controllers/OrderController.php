<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class OrderController extends Controller
{
    public function open()
    {
        $openOrders = [
            [
                'id' => 'ORD-2024-001',
                'customer_name' => 'John Smith',
                'customer_email' => 'john.smith@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Blue Sky', 'quantity' => 2, 'price' => 24.99],
                    ['name' => 'Premium Photo Print', 'quantity' => 1, 'price' => 19.99],
                ],
                'total' => 69.97,
                'status' => 'pending',
                'created_at' => '2024-01-20 10:30:00',
                'updated_at' => '2024-01-20 10:30:00',
            ],
            [
                'id' => 'ORD-2024-002',
                'customer_name' => 'Sarah Johnson',
                'customer_email' => 'sarah.j@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Sunset', 'quantity' => 1, 'price' => 24.99],
                ],
                'total' => 24.99,
                'status' => 'processing',
                'created_at' => '2024-01-20 11:45:00',
                'updated_at' => '2024-01-20 14:20:00',
            ],
            [
                'id' => 'ORD-2024-003',
                'customer_name' => 'Michael Chen',
                'customer_email' => 'mchen@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Galaxy', 'quantity' => 3, 'price' => 24.99],
                    ['name' => 'Custom Mug - Forest', 'quantity' => 2, 'price' => 24.99],
                ],
                'total' => 124.95,
                'status' => 'pending',
                'created_at' => '2024-01-20 13:00:00',
                'updated_at' => '2024-01-20 13:00:00',
            ],
            [
                'id' => 'ORD-2024-004',
                'customer_name' => 'Emma Williams',
                'customer_email' => 'emma.w@example.com',
                'items' => [
                    ['name' => 'Premium Photo Print', 'quantity' => 5, 'price' => 19.99],
                ],
                'total' => 99.95,
                'status' => 'processing',
                'created_at' => '2024-01-20 14:15:00',
                'updated_at' => '2024-01-20 16:00:00',
            ],
            [
                'id' => 'ORD-2024-005',
                'customer_name' => 'David Brown',
                'customer_email' => 'dbrown@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Mountain View', 'quantity' => 1, 'price' => 24.99],
                    ['name' => 'Custom Mug - Ocean Wave', 'quantity' => 1, 'price' => 24.99],
                ],
                'total' => 49.98,
                'status' => 'pending',
                'created_at' => '2024-01-20 15:30:00',
                'updated_at' => '2024-01-20 15:30:00',
            ],
        ];

        return Inertia::render('admin/open-orders', [
            'orders' => $openOrders,
        ]);
    }

    public function completed()
    {
        $completedOrders = [
            [
                'id' => 'ORD-2024-100',
                'customer_name' => 'Alice Thompson',
                'customer_email' => 'alice.t@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Floral Design', 'quantity' => 2, 'price' => 24.99],
                ],
                'total' => 49.98,
                'status' => 'completed',
                'created_at' => '2024-01-15 09:00:00',
                'updated_at' => '2024-01-17 14:30:00',
                'completed_at' => '2024-01-17 14:30:00',
            ],
            [
                'id' => 'ORD-2024-101',
                'customer_name' => 'Robert Davis',
                'customer_email' => 'rdavis@example.com',
                'items' => [
                    ['name' => 'Premium Photo Print', 'quantity' => 3, 'price' => 19.99],
                    ['name' => 'Custom Mug - Abstract Art', 'quantity' => 1, 'price' => 24.99],
                ],
                'total' => 84.96,
                'status' => 'shipped',
                'created_at' => '2024-01-16 10:30:00',
                'updated_at' => '2024-01-18 09:00:00',
                'completed_at' => '2024-01-18 09:00:00',
            ],
            [
                'id' => 'ORD-2024-102',
                'customer_name' => 'Lisa Martinez',
                'customer_email' => 'lmartinez@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Pet Portrait', 'quantity' => 1, 'price' => 34.99],
                ],
                'total' => 34.99,
                'status' => 'completed',
                'created_at' => '2024-01-16 14:00:00',
                'updated_at' => '2024-01-19 11:00:00',
                'completed_at' => '2024-01-19 11:00:00',
            ],
            [
                'id' => 'ORD-2024-103',
                'customer_name' => 'James Wilson',
                'customer_email' => 'jwilson@example.com',
                'items' => [
                    ['name' => 'Custom Mug - City Skyline', 'quantity' => 4, 'price' => 24.99],
                ],
                'total' => 99.96,
                'status' => 'shipped',
                'created_at' => '2024-01-17 08:45:00',
                'updated_at' => '2024-01-19 16:20:00',
                'completed_at' => '2024-01-19 16:20:00',
            ],
            [
                'id' => 'ORD-2024-104',
                'customer_name' => 'Patricia Garcia',
                'customer_email' => 'pgarcia@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Vintage Car', 'quantity' => 2, 'price' => 24.99],
                    ['name' => 'Premium Photo Print', 'quantity' => 2, 'price' => 19.99],
                ],
                'total' => 89.96,
                'status' => 'completed',
                'created_at' => '2024-01-17 11:30:00',
                'updated_at' => '2024-01-19 18:00:00',
                'completed_at' => '2024-01-19 18:00:00',
            ],
            [
                'id' => 'ORD-2024-105',
                'customer_name' => 'Christopher Lee',
                'customer_email' => 'clee@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Sports Team', 'quantity' => 6, 'price' => 24.99],
                ],
                'total' => 149.94,
                'status' => 'shipped',
                'created_at' => '2024-01-18 09:15:00',
                'updated_at' => '2024-01-20 10:00:00',
                'completed_at' => '2024-01-20 10:00:00',
            ],
            [
                'id' => 'ORD-2024-106',
                'customer_name' => 'Nancy Walker',
                'customer_email' => 'nwalker@example.com',
                'items' => [
                    ['name' => 'Custom Mug - Anniversary Special', 'quantity' => 2, 'price' => 29.99],
                ],
                'total' => 59.98,
                'status' => 'completed',
                'created_at' => '2024-01-18 13:45:00',
                'updated_at' => '2024-01-20 12:30:00',
                'completed_at' => '2024-01-20 12:30:00',
            ],
            [
                'id' => 'ORD-2024-107',
                'customer_name' => 'Daniel Anderson',
                'customer_email' => 'danderson@example.com',
                'items' => [
                    ['name' => 'Premium Photo Print', 'quantity' => 10, 'price' => 19.99],
                ],
                'total' => 199.90,
                'status' => 'shipped',
                'created_at' => '2024-01-19 07:00:00',
                'updated_at' => '2024-01-20 13:45:00',
                'completed_at' => '2024-01-20 13:45:00',
            ],
        ];

        return Inertia::render('admin/completed', [
            'orders' => $completedOrders,
        ]);
    }
}
