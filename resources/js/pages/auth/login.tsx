import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface LoginProps {
  errors?: {
    email?: string;
    password?: string;
  };
}

export default function Login({ errors = {} }: LoginProps) {
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    router.post('/login', data, {
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <>
      <Head title="Login" />

      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">Sign in to your account</CardTitle>
              <CardDescription className="text-center">Enter your email and password to access the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    required
                    autoComplete="email"
                    autoFocus
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.email}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.password}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                  {processing ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
