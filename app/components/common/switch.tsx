import { cn } from '@/infra/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, className, disabled = false }: SwitchProps) {
  return (
    <label className={cn('relative inline-flex items-center cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer"
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-500 dark:peer-focus:ring-teal-800 peer-checked:bg-teal-600 dark:peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 dark:after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
    </label>
  );
}
