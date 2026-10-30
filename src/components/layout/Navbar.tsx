import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { sectionIds, sections } from '../../config/navigation';
import { site } from '../../config/site';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useScrolled } from '../../hooks/useScrolled';
import { cn } from '../../lib/cn';
import { GitHubIcon, LinkedInIcon } from '../icons/BrandIcons';
import { ExternalLink } from '../ui/ExternalLink';
import { Wordmark } from '../ui/Wordmark';

const DESKTOP_QUERY = '(min-width: 64rem)';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(8);
  const active = useActiveSection(sectionIds);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && event.target instanceof Node && !headerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onViewportChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onViewportChange);
    };
  }, [open]);

  const elevated = scrolled || open;

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
        elevated ? 'border-line bg-canvas/90 backdrop-blur-lg' : 'border-transparent bg-canvas/0',
      )}
    >
      <nav aria-label="Primary" className="shell flex h-[4.5rem] items-center justify-between gap-4">
        <a href="#home" className="-ml-1 rounded-lg px-1 py-1.5 transition-opacity hover:opacity-75">
          <Wordmark />
        </a>

        <div className="flex items-center gap-2 lg:gap-8">
          <ul className="hidden items-center gap-7 lg:flex">
            {sections.map((section) => {
              const current = active === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? 'location' : undefined}
                    className={cn(
                      'inline-flex h-11 items-center text-[0.9375rem] underline-offset-[7px] transition-colors',
                      current
                        ? 'text-fg underline decoration-fg decoration-1'
                        : 'text-fg-subtle hover:text-fg',
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <ExternalLink
            href={site.links.github}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-fg px-3.5 text-sm font-medium text-canvas shadow-[0_8px_20px_-10px_rgb(28_25_23/0.6)] transition-colors hover:bg-stone-800 sm:px-5"
          >
            <GitHubIcon className="size-4" />
            <span className="max-sm:sr-only">GitHub</span>
          </ExternalLink>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface text-fg transition-colors hover:bg-sunken lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            <span className="sr-only">{open ? 'Close navigation menu' : 'Open navigation menu'}</span>
          </button>
        </div>
      </nav>

      <div id={menuId} hidden={!open} className="menu-enter border-t border-line lg:hidden">
        <div className="shell py-4">
          <ul className="grid gap-1">
            {sections.map((section) => {
              const current = active === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? 'location' : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex h-12 items-center justify-between rounded-xl px-4 text-base transition-colors',
                      current ? 'bg-sunken font-medium text-fg' : 'text-fg-muted hover:bg-sunken hover:text-fg',
                    )}
                  >
                    {section.label}
                    {current ? <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" /> : null}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
            <ExternalLink
              href={site.links.github}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface text-sm font-medium text-fg hover:bg-sunken"
            >
              <GitHubIcon className="size-4" /> GitHub
            </ExternalLink>
            <ExternalLink
              href={site.links.linkedin}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface text-sm font-medium text-fg hover:bg-sunken"
            >
              <LinkedInIcon className="size-4" /> LinkedIn
            </ExternalLink>
          </div>
        </div>
      </div>
    </header>
  );
}
