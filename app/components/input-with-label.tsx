'use client';

import { Info } from 'lucide-react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/infra/utils';

export interface InputWithLabelProps extends React.ComponentProps<'input'> {
  label?: string
  tooltip?: string
  error?: string
  containerClassName?: string
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ className, label, tooltip, error, containerClassName, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip open={open} onOpenChange={setOpen}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex"
                      onClick={() => setOpen(!open)}
                      onMouseEnter={() => setOpen(true)}
                      onMouseLeave={() => setOpen(false)}
                    >
                      <Info className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <Input
          className={cn(
            'p-3 h-auto focus-visible:ring-teal-500 focus-visible:border-teal-500',
            error && 'border-red-500 dark:border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
      </div>
    );
  },
);
InputWithLabel.displayName = 'InputWithLabel';

export { InputWithLabel };
