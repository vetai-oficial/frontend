'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/constants';
import { useAuth } from '@/infra/auth-context';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking || isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900'>
        <Loader2 size={32} className='animate-spin text-teal-600' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
