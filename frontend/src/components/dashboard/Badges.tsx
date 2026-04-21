import React from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    DRAFT:     'bg-stone-500/10 text-stone-500 border-stone-200 dark:border-stone-700',
    SENT:      'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
    PAID:      'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    OVERDUE:   'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800',
    CANCELLED: 'bg-stone-500/10 text-stone-400 border-stone-200 dark:border-stone-700',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border', styles[status] || styles.pending)}>
      {status}
    </span>
  );
};

export const PlanBadge: React.FC<{ plan: 'free' | 'starter' | 'pro' }> = ({ plan }) => {
  const styles: Record<string, string> = {
    free:    'bg-stone-50 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700',
    starter: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    pro:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm',
      styles[plan] || styles.free
    )}>
      {plan === 'free' ? <Lock className="w-3 h-3 opacity-50" /> : <Sparkles className="w-3 h-3 transition-transform group-hover:scale-110" />}
      {plan}
    </span>
  );
};
