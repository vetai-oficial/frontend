import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import { AdminSidebar } from './components/admin-sidebar';

import { AuthGuard } from '@/app/components/layout/auth-guard';
import '@/app/globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VetAI Admin',
  description: 'Administração da clínica',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 antialiased dark:bg-slate-950`}>
        <AuthGuard>
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden">
              <AdminSidebar />
              <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-teal-950/20">
                {children}
              </main>
            </div>
          </TooltipProvider>
        </AuthGuard>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
