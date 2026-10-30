import type { Project } from '../../types/project';
import { cn } from '../../lib/cn';

interface ProjectMediaProps {
  project: Project;
  className?: string;
}

/**
 * Screenshot set on a soft paper backdrop. The image keeps its own aspect
 * ratio and "peeks" out of the bottom edge, so it is never stretched.
 */
export function ProjectMedia({ project, className }: ProjectMediaProps) {
  return (
    <div className={cn('relative isolate overflow-hidden bg-sunken', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_20%_0%,rgb(30_64_175/0.08),transparent_70%),radial-gradient(70%_70%_at_100%_100%,rgb(28_25_23/0.06),transparent_70%)]"
      />
      {project.image ? (
        <img
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          loading="lazy"
          decoding="async"
          className="absolute top-[10%] left-1/2 h-auto w-[88%] max-w-[64rem] -translate-x-1/2 rounded-t-xl shadow-[0_0_0_1px_rgb(28_25_23/0.08),0_24px_60px_-24px_rgb(28_25_23/0.45)] transition-[top] duration-500 ease-out motion-safe:group-hover:top-[8.5%]"
        />
      ) : (
        <ProjectPlaceholder project={project} />
      )}
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Decorative interface sketch for projects without a screenshot yet. */
function ProjectPlaceholder({ project }: { project: Project }) {
  const planned = project.status === 'Under Consideration';
  const outline = planned ? 'border-dashed border-fg/20' : 'border-fg/10';

  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center p-6 sm:p-10">
      <div className={cn('w-full max-w-sm rounded-xl border bg-surface p-5 shadow-[0_24px_60px_-28px_rgb(28_25_23/0.35)]', outline)}>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-fg/15" />
          <span className="size-2 rounded-full bg-fg/10" />
          <span className="size-2 rounded-full bg-fg/[0.07]" />
          <span className="ml-2 truncate font-mono text-[0.65rem] text-fg-subtle">{project.id}</span>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <span
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-xl border bg-sunken font-serif text-xl text-fg',
              outline,
            )}
          >
            {initialsOf(project.name)}
          </span>
          <div className="flex-1 space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-fg/10" />
            <div className="h-2 w-1/2 rounded-full bg-fg/[0.06]" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((cell) => (
            <div
              key={cell}
              className={cn('h-12 rounded-lg border bg-sunken/60', planned ? 'border-dashed border-fg/15' : 'border-fg/[0.06]')}
            />
          ))}
        </div>
        <p className="mt-4 font-mono text-[0.65rem] text-fg-subtle">
          {planned ? '// scope in planning' : '// screenshot coming soon'}
        </p>
      </div>
    </div>
  );
}
