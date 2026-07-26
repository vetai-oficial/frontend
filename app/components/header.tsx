'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface HeaderProps {
  title: string;
  usedGB?: number;
  totalGB?: number;
  showStorage?: boolean;
}

export function Header({ title, usedGB = 0, totalGB = 0, showStorage = true }: HeaderProps) {
  const percentage = (usedGB / totalGB) * 100;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="mb-8 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="md:hidden print:hidden">
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </div>
        {showStorage && (
          <div className="flex flex-col gap-1 w-full md:w-[30%]">
            <span className="whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 font-medium text-center">
              {usedGB}GB de {totalGB}GB usados
            </span>
            <Progress value={percentage} className="h-2.5" />
          </div>
        )}
        <Button variant="outline" size="icon" onClick={toggleTheme} className="hidden md:flex print:hidden">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </div>
  );
}
