import type { ReactNode } from 'react';
import { ArrowUpRight, Check, Info, Lock, Star, Users } from 'lucide-react';
import { site } from '../../config/site';
import { getRepoInsight, type GitHubState, type RepoInsight } from '../../hooks/useGitHubRepos';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/format';
import type { Project } from '../../types/project';
import { GitHubIcon } from '../icons/BrandIcons';
import { buttonClasses } from '../ui/button';
import { ExternalLink } from '../ui/ExternalLink';
import { ProjectMedia } from './ProjectMedia';
import { StatusBadge } from './StatusBadge';

interface ProjectCardProps {
  project: Project;
  /** "featured": wide media on top, details in two columns. "compact": single column for the grid. */
  layout: 'featured' | 'compact';
  github: GitHubState;
}

export function ProjectCard({ project, layout, github }: ProjectCardProps) {
  const insight = getRepoInsight(project.githubUrl, project.repositoryVerified, github, site.githubUsername);
  const featured = layout === 'featured';
  const titleId = `project-${project.id}-title`;
  const description =
    project.description.trim() || insight.repo?.description || 'Project details will be added soon.';

  const intro = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={project.status} />
        {project.teamProject ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-xs font-medium text-fg-muted">
            <Users aria-hidden="true" className="size-3.5" />
            Team project
          </span>
        ) : null}
      </div>

      {project.category ? (
        <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.18em] text-accent uppercase">{project.category}</p>
      ) : null}
      <h3
        id={titleId}
        className={cn(
          'font-serif leading-none tracking-[-0.01em] text-fg',
          project.category ? 'mt-2.5' : 'mt-6',
          featured ? 'text-[2.5rem] sm:text-[3rem]' : 'text-[2.125rem]',
        )}
      >
        {project.name}
      </h3>
      {project.summary ? <p className="mt-2 text-[0.9375rem] text-fg-subtle">{project.summary}</p> : null}

      <p className="mt-4 leading-relaxed text-pretty text-fg-muted">{description}</p>
    </>
  );

  const details = (
    <>
      {project.highlights.length > 0 ? (
        <ul aria-label={`${project.name} highlights`} className={cn('space-y-2.5', !featured && 'mt-5')}>
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {project.role ? (
        <p className="mt-5 rounded-xl border border-line bg-sunken/60 p-4 text-[0.9375rem] leading-relaxed text-fg-muted">
          <span className="font-medium text-fg">My contribution: </span>
          {project.role}
        </p>
      ) : null}

      {project.technologies.length > 0 ? (
        <ul aria-label={`${project.name} technologies`} className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <li key={technology} className="tag">
              {technology}
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn('text-[0.9375rem] text-fg-subtle', (!featured || project.highlights.length > 0) && 'mt-6')}>
          Technology stack to be confirmed.
        </p>
      )}

      <RepoMeta insight={insight} />

      {project.note ? (
        <p className="mt-5 flex gap-2 text-[0.8125rem] leading-relaxed text-fg-subtle">
          <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>{project.note}</span>
        </p>
      ) : null}
    </>
  );

  const actions = (
    <div className="flex flex-wrap gap-3">
      {project.liveDemoUrl ? (
        <ExternalLink href={project.liveDemoUrl} className={buttonClasses('primary', 'md')}>
          <ArrowUpRight aria-hidden="true" />
          Live Demo
          <span className="sr-only"> of {project.name}</span>
        </ExternalLink>
      ) : null}
      {insight.availability === 'available' ? (
        <ExternalLink
          href={project.githubUrl}
          className={buttonClasses(project.liveDemoUrl ? 'secondary' : featured ? 'primary' : 'secondary', 'md')}
        >
          <GitHubIcon />
          GitHub Repository
          <span className="sr-only"> for {project.name}</span>
        </ExternalLink>
      ) : (
        <p
          data-repo-unavailable=""
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-line-strong px-5 text-[0.9375rem] text-fg-subtle"
        >
          <Lock aria-hidden="true" className="size-4" />
          Repository not public yet
        </p>
      )}
    </div>
  );

  // A featured project without a screenshot gets a slim card instead of an empty placeholder.
  const slim = featured && !project.image;

  return (
    <article
      id={`project-${project.id}`}
      aria-labelledby={titleId}
      data-project-id={project.id}
      data-repo-url={project.githubUrl}
      data-repo-state={insight.availability}
      className="card group flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-[0_1px_2px_rgb(28_25_23/0.05),0_28px_56px_-28px_rgb(28_25_23/0.28)]"
    >
      {slim ? null : (
        <ProjectMedia
          project={project}
          className={cn('border-b border-line', featured ? 'aspect-[16/10] sm:aspect-[2/1] lg:aspect-[2.3/1]' : 'aspect-[16/9]')}
        />
      )}

      {slim ? (
        <div className="grid flex-1 grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-end lg:gap-12 lg:p-10">
          <div className="min-w-0 lg:col-span-7">{intro}</div>
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-5 lg:items-end lg:text-right">
            {project.highlights.length > 0 || project.technologies.length > 0 ? (
              <div className="w-full text-left">{details}</div>
            ) : (
              <p className="text-[0.9375rem] text-fg-subtle">Technology stack to be confirmed.</p>
            )}
            {actions}
          </div>
        </div>
      ) : featured ? (
        // Phones read intro → details → actions; large screens put actions under the intro.
        <div className="grid flex-1 grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-8 lg:p-10">
          <div className="min-w-0 lg:col-span-5 lg:row-start-1">{intro}</div>
          <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-line lg:pt-1 lg:pl-12">
            {details}
          </div>
          <div className="min-w-0 lg:col-span-5 lg:row-start-2 lg:self-end">{actions}</div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          {intro}
          {details}
          <div className="mt-auto pt-8">{actions}</div>
        </div>
      )}
    </article>
  );
}

function RepoMeta({ insight }: { insight: RepoInsight }) {
  if (insight.loading) {
    return <div aria-hidden="true" className="mt-5 h-4 w-52 max-w-full animate-pulse rounded-full bg-fg/[0.06]" />;
  }

  const repo = insight.repo;
  if (!repo) return null;

  const updated = formatDate(repo.pushedAt);
  const items: Array<{ key: string; content: ReactNode }> = [];
  if (repo.language) items.push({ key: 'language', content: repo.language });
  if (updated) items.push({ key: 'updated', content: `Updated ${updated}` });
  if (repo.stars > 0) {
    items.push({
      key: 'stars',
      content: (
        <span className="inline-flex items-center gap-1">
          <Star aria-hidden="true" className="size-3" />
          {repo.stars} {repo.stars === 1 ? 'star' : 'stars'}
        </span>
      ),
    });
  }
  if (items.length === 0) return null;

  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-fg-subtle">
      <GitHubIcon className="size-3.5" />
      <span className="sr-only">Live from GitHub: </span>
      {items.map((item, index) => (
        <span key={item.key} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          {item.content}
        </span>
      ))}
    </p>
  );
}
