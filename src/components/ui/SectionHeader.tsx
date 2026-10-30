import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  titleId: string;
  description?: ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, titleId, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h2
        id={titleId}
        className="mt-4 font-serif text-[2.75rem] leading-[1.02] tracking-[-0.01em] text-balance text-fg sm:text-[3.5rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-pretty text-fg-muted sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
