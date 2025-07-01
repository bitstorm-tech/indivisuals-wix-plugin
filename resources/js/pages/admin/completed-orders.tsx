import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Download, Eye, Package2, Search, Truck } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  total: number;
  status: 'completed' | 'shipped';
  created_at: string;
  updated_at: string;
  completed_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface CompletedOrdersProps {
  orders: Order[];
  auth: {
    user: User;
  };
}

export default function Completed({ orders, auth }: CompletedOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-800">
        <Truck className="mr-1 h-3 w-3" />
        Shipped
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <Head title="Admin - Completed Orders" />
      <AdminLayout user={auth.user}>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Completed Orders</h1>
            <p className="text-gray-600">View and manage fulfilled orders</p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package2 className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-muted-foreground text-xs">Completed & shipped orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <span className="text-muted-foreground text-sm">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-muted-foreground text-xs">From completed orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <span className="text-muted-foreground text-sm">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalRevenue / orders.length).toFixed(2)}</div>
                <p className="text-muted-foreground text-xs">Per order</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>All completed and shipped orders</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedOrder(order)}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>${order.total.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-gray-500">{formatDate(order.completed_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {selectedOrder ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>{selectedOrder.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Customer Information</h3>
                      <p className="text-sm">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer_email}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 font-semibold">Items</h3>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between rounded bg-gray-50 p-2 text-sm">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-gray-500">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-right">
                              <div>${(item.price * item.quantity).toFixed(2)}</div>
                              <div className="text-xs text-gray-500">${item.price.toFixed(2)} each</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Created: </span>
                        <span>{formatDate(selectedOrder.created_at)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Completed: </span>
                        <span>{formatDate(selectedOrder.completed_at)}</span>
                      </div>
                      <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
                    </div>

                    <div className="flex gap-2 border-t pt-4">
                      <Button className="flex-1" variant="outline">
                        View Invoice
                      </Button>
                      <Button className="flex-1" variant="outline">
                        Resend Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Select an order to view details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-40 items-center justify-center text-gray-400">
                      <p>No order selected</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
