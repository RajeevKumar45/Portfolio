import { GraduationCap } from 'lucide-react';
import { portrait } from '../../config/portrait';
import { site } from '../../config/site';

/** Portrait in a raised paper card with a caption, in the style of a printed photo. */
export function HeroPortrait() {
  return (
    <figure className="card mx-auto w-full max-w-[24rem] rounded-[1.75rem] p-3 sm:p-3.5 lg:max-w-[26rem]">
      <img
        src={portrait.large}
        srcSet={`${portrait.small} 480w, ${portrait.large} 960w`}
        sizes="(min-width: 64rem) 26rem, (min-width: 40rem) 24rem, calc(100vw - 4rem)"
        alt={portrait.alt}
        width={portrait.width}
        height={portrait.height}
        fetchPriority="high"
        decoding="async"
        data-hero-portrait=""
        className="block aspect-[4/5] w-full rounded-[1.25rem] bg-sunken object-cover"
      />
      <figcaption className="flex items-center justify-between gap-4 px-3 pt-4 pb-2 sm:px-4">
        <span className="min-w-0">
          <span className="block font-serif text-[1.375rem] leading-tight text-fg italic">{site.name}</span>
          <span className="mt-1 block text-[0.6875rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
            {portrait.caption}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-fg-subtle"
        >
          <GraduationCap className="size-[1.125rem]" />
        </span>
      </figcaption>
    </figure>
  );
}
