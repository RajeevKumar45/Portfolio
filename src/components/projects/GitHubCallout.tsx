import { ArrowUpRight } from 'lucide-react';
import { profileHandle, site } from '../../config/site';
import { summarizeProfile, type GitHubState } from '../../hooks/useGitHubRepos';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import { GitHubIcon } from '../icons/BrandIcons';
import { buttonClasses } from '../ui/button';
import { ExternalLink } from '../ui/ExternalLink';

interface GitHubCalloutProps {
  github: GitHubState;
  /** "tile" is a dark card that fills a grid cell; "banner" is a light full-width strip. */
  layout: 'tile' | 'banner';
  className?: string;
}

/** Profile call-to-action with live public data when the GitHub API responds. */
export function GitHubCallout({ github, layout, className }: GitHubCalloutProps) {
  const tile = layout === 'tile';

  return (
    <div
      className={cn(
        'relative isolate flex overflow-hidden rounded-[1.25rem] p-6 sm:p-8',
        tile
          ? 'min-h-[22rem] flex-col justify-between gap-10 bg-fg text-canvas shadow-[0_28px_56px_-28px_rgb(28_25_23/0.6)]'
          : 'card flex-col gap-6 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {tile ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_100%_0%,rgb(96_165_250/0.22),transparent_70%)]"
        />
      ) : null}

      <div className={cn('flex gap-4', tile && 'flex-col gap-0')}>
        <span
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-xl border',
            tile ? 'border-white/15 bg-white/10 text-canvas' : 'border-line bg-sunken text-fg',
          )}
        >
          <GitHubIcon className="size-5" />
        </span>
        <div className={cn(tile && 'mt-6')}>
          <h3 className={cn(tile ? 'font-serif text-[2.125rem] leading-none' : 'font-medium text-fg')}>
            More on GitHub
          </h3>
          <p className={cn('mt-2 font-mono text-xs', tile ? 'text-stone-400' : 'text-fg-subtle')}>
            @{profileHandle(site.links.github)}
          </p>
          {tile ? (
            <p className="mt-5 max-w-sm leading-relaxed text-stone-300">
              Explore the rest of my public repositories, source code, and commit history.
            </p>
          ) : null}
          <ProfileLine github={github} tile={tile} />
        </div>
      </div>

      <ExternalLink
        href={site.links.github}
        className={
          tile
            ? 'inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-canvas px-5 text-[0.9375rem] font-medium text-fg transition-colors hover:bg-white [&_svg]:size-[1.05em]'
            : buttonClasses('secondary', 'md', 'self-start sm:self-auto')
        }
      >
        View GitHub Profile
        <ArrowUpRight aria-hidden="true" />
      </ExternalLink>
    </div>
  );
}

function ProfileLine({ github, tile }: { github: GitHubState; tile: boolean }) {
  if (github.status === 'loading') {
    return (
      <div
        aria-hidden="true"
        className={cn('mt-4 h-4 w-60 max-w-full animate-pulse rounded-full', tile ? 'bg-white/10' : 'bg-fg/[0.06]')}
      />
    );
  }

  if (github.status === 'error' || github.snapshot.repos.length === 0) {
    return tile ? null : (
      <p className="mt-3 text-[0.9375rem] text-fg-muted">
        Browse all of my public repositories, source code, and commit history.
      </p>
    );
  }

  const summary = summarizeProfile(github.snapshot);
  const count = `${summary.repoCount}${summary.countIsExact ? '' : '+'}`;
  const lastPush = formatDate(summary.lastPushAt);

  return (
    <p data-github-summary="" className={cn('mt-4 text-[0.9375rem]', tile ? 'text-stone-300' : 'text-fg-muted')}>
      <span className={tile ? 'text-canvas' : 'text-fg'}>{count}</span> public{' '}
      {summary.repoCount === 1 ? 'repository' : 'repositories'}
      {lastPush ? (
        <span className={tile ? 'text-stone-400' : 'text-fg-subtle'}> · most recent push {lastPush}</span>
      ) : null}
    </p>
  );
}
