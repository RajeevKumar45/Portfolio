import type { ComponentPropsWithoutRef } from 'react';

type ExternalLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'target' | 'rel'> & { href: string };

/** Opens in a new tab safely and tells screen-reader users that it does. */
export function ExternalLink({ children, ...props }: ExternalLinkProps) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
