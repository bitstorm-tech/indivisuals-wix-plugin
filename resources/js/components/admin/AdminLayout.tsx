import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function AdminLayout({ user, children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar user={user} />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-auto">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-4 left-4 z-40 bg-white shadow-md md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation Menu</SheetTitle>
              <SheetDescription>Navigate through admin sections</SheetDescription>
            </SheetHeader>
            <AdminSidebar user={user} onNavigate={handleMobileMenuClose} />
          </SheetContent>
        </Sheet>

        {children}
      </div>
    </div>
  );
}
