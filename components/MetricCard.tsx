'use client';

import {
  Users,
  MailPlus,
  PawPrint,
  Microscope,
  MessagesSquare,
  ClipboardList,
  Calendar,
  Stethoscope,
  HelpCircle,
} from 'lucide-react';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/infra/utils';

const iconsMap = {
  Users,
  MailPlus,
  PawPrint,
  Microscope,
  MessagesSquare,
  ClipboardList,
  Calendar,
  Stethoscope,
};

interface MetricCardProps {
  icon: keyof typeof iconsMap;
  color: string;
  title: string;
  value: string | number;
  tooltip?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  icon,
  color,
  title,
  value,
  tooltip,
  loading = false,
  className,
}: MetricCardProps) {
  const IconComponent = iconsMap[icon];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-card/80 shadow-sm hover:shadow-md',
        'group cursor-default',
        className,
      )}
    >
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            {loading ? (
              <Skeleton className='h-4 w-28' />
            ) : (
              <>
                <span className='text-sm font-medium text-muted-foreground'>
                  {title}
                </span>
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className='h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors' />
                    </TooltipTrigger>
                    <TooltipContent side='top' align='center'>
                      <p className='max-w-[200px] leading-relaxed'>{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>

          <div className='flex items-baseline gap-1'>
            {loading ? (
              <Skeleton className='h-9 w-20' />
            ) : (
              <h3 className='text-3xl font-bold tracking-tight text-foreground'>
                {value}
              </h3>
            )}
          </div>
        </div>

        <div
          className='flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 border'
          style={{
            backgroundColor: `${color}25`,
            borderColor: `${color}40`,
            color,
          }}
        >
          <IconComponent className='h-6 w-6' strokeWidth={2.5} />
        </div>
      </div>

      {/* Subtle bottom gradient sweep */}
      <div
        className='absolute bottom-0 left-0 h-1.5 w-full opacity-40 transition-opacity group-hover:opacity-70'
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
