import { site } from '../../config/site';
import { cn } from '../../lib/cn';

/** Serif name used as the logo in the navigation bar and footer. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('font-serif text-[1.625rem] leading-none tracking-[-0.01em] text-fg', className)}>{site.name}</span>;
}
