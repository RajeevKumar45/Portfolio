import { ArrowUp, Mail } from 'lucide-react';
import { emailHref, site } from '../../config/site';
import { GitHubIcon, LeetCodeIcon, LinkedInIcon } from '../icons/BrandIcons';
import { ExternalLink } from '../ui/ExternalLink';
import { Wordmark } from '../ui/Wordmark';

const linkClass =
  'inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-fg-muted transition-colors hover:bg-sunken hover:text-fg';

// Evaluated when the page loads, so the copyright year is always current.
const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-line bg-sunken/60">
      <div className="shell flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p>
            <Wordmark className="text-[1.875rem]" />
          </p>
          <p className="mt-3 text-[0.9375rem] text-fg-muted">{site.tagline}</p>
        </div>

        <nav aria-label="Profiles and contact">
          <ul className="-mx-3 flex flex-wrap gap-1">
            <li>
              <ExternalLink href={site.links.github} className={linkClass}>
                <GitHubIcon className="size-4" />
                GitHub
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={site.links.linkedin} className={linkClass}>
                <LinkedInIcon className="size-4" />
                LinkedIn
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={site.links.leetcode} className={linkClass}>
                <LeetCodeIcon className="size-4" />
                LeetCode
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={emailHref} className={linkClass}>
                <Mail aria-hidden="true" className="size-4" />
                Email
              </ExternalLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col-reverse gap-2 py-5 text-[0.8125rem] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Built with React, TypeScript, and Tailwind CSS.
          </p>
          <a href="#home" className="-mx-2 inline-flex min-h-11 items-center gap-1.5 self-start rounded-full px-2 transition-colors hover:text-fg sm:self-auto">
            Back to top
            <ArrowUp aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
