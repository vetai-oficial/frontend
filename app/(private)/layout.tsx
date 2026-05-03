import { AuthGuard } from '@/app/components/layout/auth-guard';
import { Sidebar } from '@/app/components/layout/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <TooltipProvider>
        <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900'>
          <Sidebar />
          <main className='flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900'>
            {children}
          </main>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
