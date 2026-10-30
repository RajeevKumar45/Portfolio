import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { emailHref, profileHandle, site } from '../../config/site';
import { cn } from '../../lib/cn';
import { GitHubIcon, LeetCodeIcon, LinkedInIcon } from '../icons/BrandIcons';
import { buttonClasses } from '../ui/button';
import { ExternalLink } from '../ui/ExternalLink';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';
import { ContactForm } from './ContactForm';

interface Channel {
  label: string;
  value: string;
  description: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const channels: Channel[] = [
  {
    label: 'Email',
    value: site.email,
    description: 'Opens a new email in Gmail',
    href: emailHref,
    icon: Mail,
  },
  {
    label: 'LinkedIn',
    value: profileHandle(site.links.linkedin),
    description: 'Connect professionally',
    href: site.links.linkedin,
    icon: LinkedInIcon,
  },
  {
    label: 'GitHub',
    value: profileHandle(site.links.github),
    description: 'Repositories and source code',
    href: site.links.github,
    icon: GitHubIcon,
  },
  {
    label: 'LeetCode',
    value: profileHandle(site.links.leetcode),
    description: 'Problem-solving practice',
    href: site.links.leetcode,
    icon: LeetCodeIcon,
  },
];

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section border-t border-line">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="min-w-0 lg:col-span-7">
          <SectionHeader
            eyebrow="Contact"
            title={
              <>
                {site.contact.headingLead} <em className="text-accent italic">{site.contact.headingAccent}</em>
              </>
            }
            titleId="contact-title"
            description={site.contact.description}
          />
          <div className="mt-10">
            <ContactForm />
          </div>
        </Reveal>

        <Reveal className="min-w-0 lg:col-span-5 lg:pt-12" delay={100}>
          <h3 className="eyebrow">Digital presence</h3>
          <ul className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            {channels.map((channel) => (
              <li key={channel.label} className="min-w-0">
                <ChannelLink channel={channel} />
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-line pt-8">
            <p className="text-[0.9375rem] text-fg-muted">Prefer your own email app? Copy my address:</p>
            <p className="mt-2 font-mono text-[0.9375rem] break-words text-fg">
              <BreakableValue value={site.email} />
            </p>
            <div className="mt-5">
              <CopyEmailButton />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChannelLink({ channel }: { channel: Channel }) {
  const Icon = channel.icon;
  return (
    <ExternalLink
      href={channel.href}
      className="card group flex h-full min-h-[8.5rem] flex-col justify-between gap-5 p-5 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-[0_1px_2px_rgb(28_25_23/0.05),0_20px_40px_-20px_rgb(28_25_23/0.25)]"
    >
      <span className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-full bg-fg text-canvas">
          <Icon aria-hidden="true" className="size-[1.05rem]" />
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 text-fg-subtle transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
        />
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-fg">{channel.label}</span>
        <span className="mt-0.5 block text-[0.8125rem] text-fg-subtle">{channel.description}</span>
        <span className="mt-2 block font-mono text-[0.8125rem] break-words text-fg-muted">
          <BreakableValue value={channel.value} />
        </span>
      </span>
    </ExternalLink>
  );
}

/** Lets an email address wrap after the "@" on narrow screens instead of mid-word. */
function BreakableValue({ value }: { value: string }) {
  const at = value.indexOf('@');
  if (at === -1) return <>{value}</>;
  return (
    <>
      {value.slice(0, at + 1)}
      <wbr />
      {value.slice(at + 1)}
    </>
  );
}

type CopyState = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy approach.
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function CopyEmailButton() {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const copied = await copyText(site.email);
    setState(copied ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2500);
  };

  const label = state === 'copied' ? 'Email copied' : state === 'failed' ? 'Copy unavailable' : 'Copy Email';

  return (
    <>
      <button type="button" onClick={onCopy} className={cn(buttonClasses('secondary', 'md'), 'min-w-[10.5rem]')}>
        {state === 'copied' ? <Check aria-hidden="true" className="text-emerald-700" /> : <Copy aria-hidden="true" />}
        {label}
      </button>
      <output aria-live="polite" data-copy-status="" className="sr-only">
        {state === 'copied'
          ? `${site.email} copied to clipboard.`
          : state === 'failed'
            ? `Copying is not available. The email address is ${site.email}.`
            : ''}
      </output>
    </>
  );
}
