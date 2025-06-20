import { Button } from '@/components/ui/Button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { router, usePage } from '@inertiajs/react';
import { Coffee, FileText, LogOut } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminSidebarProps {
  user: User;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const { url } = usePage();
  const [openItems, setOpenItems] = useState<string[]>(['prompts', 'mugs']);

  const handleLogout = () => {
    router.post('/logout');
  };

  const handleNavigate = (route: string) => {
    router.visit(route);
  };

  const isActive = (path: string) => url === path;

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-2">
          {/* Prompts Section */}
          <AccordionItem value="prompts" className="border-none">
            <AccordionTrigger className="rounded-md px-3 py-2 hover:bg-gray-100 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Prompts</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="ml-4 space-y-1">
              <button
                onClick={() => handleNavigate('/admin/prompts')}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 ${
                  isActive('/admin/prompts') || isActive('/admin') ? 'bg-gray-200 font-medium' : ''
                }`}
              >
                All Prompts
              </button>
              <button
                onClick={() => handleNavigate('/admin/prompts/categories')}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 ${
                  isActive('/admin/prompts/categories') ? 'bg-gray-200 font-medium' : ''
                }`}
              >
                Categories
              </button>
            </AccordionContent>
          </AccordionItem>

          {/* Mugs Section */}
          <AccordionItem value="mugs" className="border-none">
            <AccordionTrigger className="rounded-md px-3 py-2 hover:bg-gray-100 hover:no-underline">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                <span>Mugs</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="ml-4 space-y-1">
              <button
                onClick={() => handleNavigate('/admin/mugs')}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 ${
                  isActive('/admin/mugs') ? 'bg-gray-200 font-medium' : ''
                }`}
              >
                All Mugs
              </button>
              <button
                onClick={() => handleNavigate('/admin/mugs/categories')}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 ${
                  isActive('/admin/mugs/categories') ? 'bg-gray-200 font-medium' : ''
                }`}
              >
                Categories
              </button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t p-4">
        <div className="mb-3 px-2">
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
