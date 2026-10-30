import { Fragment } from 'react';
import { Braces, GraduationCap, MapPin, Sparkles, Wrench } from 'lucide-react';
import { site } from '../../config/site';
import { GitHubIcon, LinkedInIcon } from '../icons/BrandIcons';
import { buttonClasses } from '../ui/button';
import { ExternalLink } from '../ui/ExternalLink';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

const focusIcons = [Braces, Sparkles, Wrench];

export function About() {
  const headlineParts = site.headline.split('|').map((part) => part.trim());

  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="min-w-0 lg:col-span-7">
          <SectionHeader
            eyebrow="About"
            title={
              <>
                About <em className="text-accent italic">Me</em>
              </>
            }
            titleId="about-title"
          />
          <p className="mt-5 text-[0.9375rem] font-medium text-fg">
            {headlineParts.map((part, index) => (
              <Fragment key={part}>
                {index > 0 ? <span className="mx-2 text-fg-subtle">|</span> : null}
                {part}
              </Fragment>
            ))}
          </p>

          <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75] text-pretty text-fg-muted">
            {site.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <ExternalLink href={site.links.github} className={buttonClasses('secondary', 'md')}>
              <GitHubIcon />
              GitHub
            </ExternalLink>
            <ExternalLink href={site.links.linkedin} className={buttonClasses('secondary', 'md')}>
              <LinkedInIcon />
              LinkedIn
            </ExternalLink>
          </div>
        </Reveal>

        <Reveal className="min-w-0 lg:col-span-5 lg:pt-16" delay={120}>
          <aside aria-labelledby="focus-title" className="card overflow-hidden">
            <div className="p-6 sm:p-8">
              <h3 id="focus-title" className="eyebrow">
                What I work on
              </h3>
              <ul className="mt-6 space-y-6">
                {site.focusAreas.map((area, index) => {
                  const Icon = focusIcons[index % focusIcons.length] ?? Braces;
                  return (
                    <li key={area.title} className="flex gap-4">
                      <span className="icon-tile">
                        <Icon aria-hidden="true" className="size-[1.1rem]" />
                      </span>
                      <div>
                        <p className="font-medium text-fg">{area.title}</p>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-fg-muted">{area.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <dl className="grid gap-4 border-t border-line bg-sunken/60 p-6 text-sm sm:px-8">
              <div className="flex gap-3">
                <dt className="shrink-0">
                  <GraduationCap aria-hidden="true" className="mt-0.5 size-4 text-fg" />
                  <span className="sr-only">Education</span>
                </dt>
                <dd className="text-fg-muted">
                  B.E. in Computer Science Engineering, {site.education.institution}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="shrink-0">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 text-fg" />
                  <span className="sr-only">Location</span>
                </dt>
                <dd className="text-fg-muted">{site.education.location}</dd>
              </div>
            </dl>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
