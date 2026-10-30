import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
}

function canAnimate(): boolean {
  return 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fades content in once it scrolls into view. Content is shown immediately when
 * the user prefers reduced motion or IntersectionObserver is unavailable.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => !canAnimate());

  useEffect(() => {
    const element = ref.current;
    if (visible || !element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined;

  return (
    <div ref={ref} className={cn('reveal', visible && 'is-visible', className)} style={style}>
      {children}
    </div>
  );
}
