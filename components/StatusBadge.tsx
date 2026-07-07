'use client';

import Timer from './Timer';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({
  createdAt,
  stoppedAt,
  className,
}: {
  createdAt: string;
  stoppedAt?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        stoppedAt
          ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'
          : 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400',
        className,
      )}
    >
      {!stoppedAt && (
        <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-amber-500 dark:bg-amber-400" />
      )}
      <Timer createdAt={createdAt} stoppedAt={stoppedAt} />
      {stoppedAt && ' · 已結束'}
    </Badge>
  );
}
