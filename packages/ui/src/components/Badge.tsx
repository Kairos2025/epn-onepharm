import React from 'react';
import { cn } from '../utils.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-sky-100 text-sky-800 hover:bg-sky-200': variant === 'default',
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200': variant === 'secondary',
          'border-transparent bg-emerald-100 text-emerald-800': variant === 'success',
          'border-transparent bg-amber-100 text-amber-800': variant === 'warning',
          'border-transparent bg-rose-100 text-rose-800': variant === 'danger',
          'border-slate-300 text-slate-700': variant === 'outline'
        },
        className
      )}
      {...props}
    />
  );
}
