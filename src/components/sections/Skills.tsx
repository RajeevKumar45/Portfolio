import { Fragment } from 'react';
import { BrainCircuit, CodeXml, Database, LayoutTemplate, Server, Telescope, Wrench, type LucideIcon } from 'lucide-react';
import { findProject } from '../../config/projects';
import { interests, skillGroups, type SkillEvidence, type SkillGroup } from '../../config/skills';
import { ExternalLink } from '../ui/ExternalLink';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

const groupIcons: Record<SkillGroup['icon'], LucideIcon> = {
  languages: CodeXml,
  frontend: LayoutTemplate,
  backend: Server,
  databases: Database,
  ai: BrainCircuit,
  tools: Wrench,
};

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section border-y border-line bg-sunken/60">
      <div className="shell">
        <Reveal>
          <SectionHeader
            eyebrow="Skills"
            title={
              <>
                Technical <em className="text-accent italic">Skills</em>
              </>
            }
            titleId="skills-title"
            description="Technologies I have used in my public projects, grouped by area. Each group links to the projects where it appears; areas I am still exploring are listed separately as interests."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, index) => (
            <li key={group.id}>
              <Reveal className="h-full" delay={(index % 3) * 70}>
                <SkillCard group={group} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-4">
          <div className="rounded-[1.25rem] border border-dashed border-line-strong bg-surface/60 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <span className="icon-tile">
                  <Telescope aria-hidden="true" className="size-[1.1rem]" />
                </span>
                <div>
                  <h3 className="font-medium text-fg">Areas of interest</h3>
                  <p className="mt-1 text-[0.9375rem] text-fg-muted">
                    Fields I am actively learning and exploring, not proficiency claims.
                  </p>
                </div>
              </div>
              <ul aria-label="Areas of interest" className="flex flex-wrap gap-2 lg:max-w-[34rem] lg:justify-end">
                {interests.map((interest) => (
                  <li key={interest} className="tag border-dashed">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SkillCard({ group }: { group: SkillGroup }) {
  const Icon = groupIcons[group.icon];
  const titleId = `skills-${group.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="card flex h-full flex-col p-6 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-[0_1px_2px_rgb(28_25_23/0.05),0_20px_40px_-20px_rgb(28_25_23/0.22)]"
    >
      <div className="flex items-center gap-3">
        <span className="icon-tile">
          <Icon aria-hidden="true" className="size-[1.1rem]" />
        </span>
        <h3 id={titleId} className="font-medium text-fg">
          {group.title}
        </h3>
      </div>

      <ul aria-label={`${group.title} technologies`} className="mt-6 flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <li key={skill} className="tag text-fg">
            {skill}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <p className="border-t border-line pt-4 text-[0.8125rem] leading-relaxed text-fg-subtle">
          <span className="text-fg-muted">Used in </span>
          {group.evidence.map((item, index) => (
            <Fragment key={evidenceKey(item)}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              <EvidenceLink item={item} />
            </Fragment>
          ))}
        </p>
        {group.note ? <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-subtle">{group.note}</p> : null}
      </div>
    </article>
  );
}

function evidenceKey(item: SkillEvidence): string {
  return 'projectId' in item ? item.projectId : item.href;
}

const evidenceLinkClass =
  'text-fg-muted underline decoration-fg/20 underline-offset-4 transition-colors hover:text-fg hover:decoration-fg';

function EvidenceLink({ item }: { item: SkillEvidence }) {
  if ('href' in item) {
    return (
      <ExternalLink href={item.href} className={evidenceLinkClass}>
        {item.label}
      </ExternalLink>
    );
  }
  const project = findProject(item.projectId);
  if (!project) return null;
  return (
    <a href={`#project-${project.id}`} className={evidenceLinkClass}>
      {project.name}
    </a>
  );
}
