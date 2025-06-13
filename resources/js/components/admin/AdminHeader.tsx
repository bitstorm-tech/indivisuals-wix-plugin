import { Button } from '@/components/ui/Button';
import { router } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminHeaderProps {
  user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold">Admin Dashboard - Prompts</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Welcome, {user.name}</span>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
