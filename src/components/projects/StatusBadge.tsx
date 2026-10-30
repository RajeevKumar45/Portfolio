import { CircleCheck, CircleDashed, Hammer, type LucideIcon } from 'lucide-react';
import type { ProjectStatus } from '../../types/project';
import { cn } from '../../lib/cn';

const statusStyles: Record<ProjectStatus, { icon: LucideIcon; className: string }> = {
  'Under Consideration': {
    icon: CircleDashed,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  'In Development': {
    icon: Hammer,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  Completed: {
    icon: CircleCheck,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
};

/** Status label with an icon and text, so status never relies on color alone. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { icon: Icon, className } = statusStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      <span>
        <span className="sr-only">Status: </span>
        {status}
      </span>
    </span>
  );
}
