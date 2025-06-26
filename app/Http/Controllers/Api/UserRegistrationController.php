<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserRegistrationController extends Controller
{
    /**
     * Register or login a user from the editor
     */
    public function registerOrLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:50',
        ]);

        // Check if user already exists (case-insensitive)
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->first();

        if ($user) {
            // Update user profile if additional fields are provided
            if ($validated['first_name'] || $validated['last_name'] || $validated['phone_number']) {
                $user->update([
                    'first_name' => $validated['first_name'] ?? $user->first_name,
                    'last_name' => $validated['last_name'] ?? $user->last_name,
                    'phone_number' => $validated['phone_number'] ?? $user->phone_number,
                ]);
            }
        } else {
            // Create new user
            $user = User::create([
                'email' => $validated['email'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone_number' => $validated['phone_number'],
                'password' => Hash::make(Str::random(32)), // Random password since we're using passwordless auth
            ]);
        }

        // Log the user in
        Auth::login($user);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone_number' => $user->phone_number,
            ],
            'authenticated' => true,
        ]);
    }

    /**
     * Check if user is authenticated
     */
    public function check(): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();

            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone_number' => $user->phone_number,
                ],
            ]);
        }

        return response()->json(['authenticated' => false]);
    }
}
