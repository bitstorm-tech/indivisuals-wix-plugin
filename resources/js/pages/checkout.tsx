import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiFetch } from '@/lib/utils';
import type { Auth } from '@/types';
import { router } from '@inertiajs/react';
import { CreditCard, Lock, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CheckoutPageProps {
  auth: Auth;
}

interface CartItem {
  id: number;
  mug: {
    id: number;
    name: string;
    image: string;
  };
  generated_image_path: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  total_items: number;
}

interface FormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  shipping_address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  sameAsBilling: boolean;
}

export default function CheckoutPage({ auth }: CheckoutPageProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: (auth.user?.email as string) || '',
    first_name: (auth.user?.first_name as string) || '',
    last_name: (auth.user?.last_name as string) || '',
    phone: (auth.user?.phone_number as string) || '',
    shipping_address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    sameAsBilling: true,
  });

  const fetchCart = async () => {
    try {
      const response = await apiFetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('shipping_address.')) {
      const addressField = field.replace('shipping_address.', '');
      setFormData((prev) => ({
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const shipping = 4.99;
      const tax = cart.subtotal * 0.08;

      const response = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          shipping_address: formData.shipping_address,
          billing_address: formData.sameAsBilling ? null : formData.shipping_address,
          shipping: shipping,
          tax: tax,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const data = await response.json();

      // Redirect to order confirmation or success page
      alert(`Order ${data.order.order_number} created successfully! Total: $${data.order.total}`);
      router.visit('/');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-gray-600">Add items to your cart before checking out</p>
          <Button onClick={() => router.visit('/cart')} className="mt-6">
            View Cart
          </Button>
        </div>
      </div>
    );
  }

  const shipping = 4.99;
  const tax = cart.subtotal * 0.08;
  const total = cart.subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="John"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Doe"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.shipping_address.line1}
                      onChange={(e) => handleInputChange('shipping_address.line1', e.target.value)}
                      placeholder="123 Main Street"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="address2"
                      value={formData.shipping_address.line2}
                      onChange={(e) => handleInputChange('shipping_address.line2', e.target.value)}
                      placeholder="Apt 4B"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.shipping_address.city}
                      onChange={(e) => handleInputChange('shipping_address.city', e.target.value)}
                      placeholder="New York"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.shipping_address.state}
                      onChange={(e) => handleInputChange('shipping_address.state', e.target.value)}
                      placeholder="NY"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={formData.shipping_address.postal_code}
                      onChange={(e) => handleInputChange('shipping_address.postal_code', e.target.value)}
                      placeholder="10001"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.shipping_address.country}
                      onChange={(e) => handleInputChange('shipping_address.country', e.target.value)}
                      placeholder="US"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBilling}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sameAsBilling: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Billing address same as shipping</span>
                  </label>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h2>
                <p className="text-sm text-gray-600">
                  Payment processing will be implemented in the next phase. For now, orders will be created without payment.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                        <img src={`/api/images/${item.generated_image_path}`} alt="Custom mug design" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{item.mug.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">${item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={isProcessing}>
                <Lock className="h-4 w-4" />
                {isProcessing ? 'Processing...' : `Buy Now • $${total.toFixed(2)}`}
              </Button>

              <div className="text-center text-xs text-gray-500">
                <Lock className="mx-auto mb-1 h-4 w-4" />
                Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
