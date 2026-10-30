import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { site } from '../../config/site';
import { GitHubIcon, LeetCodeIcon, LinkedInIcon } from '../icons/BrandIcons';
import { buttonClasses } from '../ui/button';
import { ExternalLink } from '../ui/ExternalLink';
import { HeroPortrait } from './HeroPortrait';

const enterDelay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

const toHashtag = (tag: string) => `#${tag.toUpperCase().replace(/[\s/-]+/g, '_')}`;

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-line pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28"
    >
      <div className="shell grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <p
            className="enter inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-[0.6875rem] font-medium tracking-[0.14em] text-fg-muted uppercase shadow-[0_1px_2px_rgb(28_25_23/0.05)] sm:text-xs"
            style={enterDelay(0)}
          >
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
            {site.hero.label}
          </p>

          <h1
            id="hero-title"
            className="enter mt-8 font-serif text-[3.25rem] leading-[0.98] tracking-[-0.015em] text-balance text-fg sm:text-[4.75rem] lg:text-[4.5rem] xl:text-[5.25rem]"
            style={enterDelay(80)}
          >
            {site.hero.headlineLead} <em className="text-accent italic">{site.hero.headlineAccent}</em>{' '}
            {site.hero.headlineTail}
          </h1>

          <p
            className="enter mt-8 max-w-xl text-lg leading-relaxed text-pretty text-fg-muted sm:text-xl sm:leading-relaxed"
            style={enterDelay(160)}
          >
            {site.hero.intro}
          </p>

          <div className="enter mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={enterDelay(240)}>
            <a href="#projects" className={buttonClasses('primary', 'lg', 'group')}>
              Explore My Projects
              <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <ExternalLink href={site.links.github} className={buttonClasses('secondary', 'lg')}>
              <GitHubIcon />
              View GitHub
            </ExternalLink>
            <ExternalLink href={site.links.linkedin} className={buttonClasses('secondary', 'lg')}>
              <LinkedInIcon />
              Connect on LinkedIn
            </ExternalLink>
          </div>

          <div
            className="enter mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem]"
            style={enterDelay(300)}
          >
            <a
              href="#contact"
              className="group inline-flex min-h-11 items-center gap-1.5 font-medium text-fg underline decoration-fg/30 underline-offset-[6px] transition-colors hover:decoration-fg"
            >
              Let&apos;s Talk
              <ArrowDown aria-hidden="true" className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <span aria-hidden="true" className="h-4 w-px bg-line-strong" />
            <ExternalLink
              href={site.links.leetcode}
              className="inline-flex min-h-11 items-center gap-2 text-fg-subtle transition-colors hover:text-fg"
            >
              <LeetCodeIcon className="size-4" />
              LeetCode profile
            </ExternalLink>
          </div>

          <ul aria-label="Focus areas" className="enter mt-8 flex flex-wrap gap-2" style={enterDelay(360)}>
            {site.hero.focusTags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-medium tracking-[0.12em] text-fg-muted"
              >
                {toHashtag(tag)}
              </li>
            ))}
          </ul>
        </div>

        <div className="enter min-w-0 lg:col-span-5" style={enterDelay(180)}>
          <HeroPortrait />
        </div>
      </div>
    </section>
  );
}
