import type { ReactNode, FC } from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'indigo'
  | 'sky';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      border: 'border-emerald-200/60',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dotColor: 'bg-amber-500',
      border: 'border-amber-200/60',
    },
    danger: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      dotColor: 'bg-rose-500',
      border: 'border-rose-200/60',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dotColor: 'bg-blue-500',
      border: 'border-blue-200/60',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      dotColor: 'bg-indigo-600',
      border: 'border-indigo-200/60',
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      dotColor: 'bg-sky-500',
      border: 'border-sky-200/60',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dotColor: 'bg-slate-400',
      border: 'border-slate-200',
    },
  };

  const current = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor}`} />}
      {children}
    </span>
  );
};
