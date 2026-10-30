import { Building2, GraduationCap, MapPin } from 'lucide-react';
import { site } from '../../config/site';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

export function Education() {
  const { degree, institution, location } = site.education;

  return (
    <section id="education" aria-labelledby="education-title" className="section border-t border-line bg-sunken/60">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="min-w-0 lg:col-span-5">
          <SectionHeader
            eyebrow="Education"
            title={<em className="italic">Education</em>}
            titleId="education-title"
            description="My academic foundation in computer science and engineering."
          />
        </Reveal>

        <Reveal className="min-w-0 lg:col-span-7" delay={100}>
          <article aria-labelledby="degree-title" className="card relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent" />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="icon-tile size-12">
                <GraduationCap aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                  Currently pursuing
                </span>
                <h3
                  id="degree-title"
                  className="mt-4 font-serif text-[1.875rem] leading-[1.1] text-balance text-fg sm:text-[2.25rem]"
                >
                  {degree}
                </h3>
                <dl className="mt-6 grid gap-3 text-[0.9375rem]">
                  <div className="flex items-start gap-3">
                    <dt className="shrink-0">
                      <Building2 aria-hidden="true" className="mt-0.5 size-4 text-fg-subtle" />
                      <span className="sr-only">Institution</span>
                    </dt>
                    <dd className="font-medium text-fg">{institution}</dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="shrink-0">
                      <MapPin aria-hidden="true" className="mt-0.5 size-4 text-fg-subtle" />
                      <span className="sr-only">Location</span>
                    </dt>
                    <dd className="text-fg-muted">{location}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
