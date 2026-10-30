import { useId, useState, type FormEvent } from 'react';
import { ArrowUpRight, CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { composeEmailHref, site } from '../../config/site';
import { cn } from '../../lib/cn';
import { ExternalLink } from '../ui/ExternalLink';

type FieldName = 'name' | 'email' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'draft-opened' }
  | { kind: 'error'; message: string; fallbackHref: string };

const LIMITS = { name: 80, email: 120, message: 2000 } as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.message.trim().length < 10) errors.message = 'Please write a message of at least 10 characters.';
  return errors;
}

function draftFor(values: Record<FieldName, string>) {
  const name = values.name.trim();
  const subject = `Portfolio enquiry from ${name}`;
  const body = `Hi Rajeev,\n\n${values.message.trim()}\n\n${name}\n${values.email.trim()}`;
  return composeEmailHref(subject, body);
}

/**
 * Contact form. With `site.contact.formEndpoint` set, messages go straight to
 * your inbox via Formspree and success is shown only after Formspree confirms.
 * Without it, submitting opens a pre-filled Gmail draft the visitor sends.
 */
export function ContactForm() {
  const endpoint = site.contact.formEndpoint;
  const mode = endpoint ? 'formspree' : 'draft';
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const ids = { name: useId(), email: useId(), message: useId(), note: useId() };

  const readValues = (form: HTMLFormElement): Record<FieldName, string> => {
    const data = new FormData(form);
    return {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readValues(form);
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (['name', 'email', 'message'] as const).find((field) => found[field]);
    if (firstInvalid) {
      const field = form.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
      setStatus({ kind: 'idle' });
      return;
    }

    const fallbackHref = draftFor(values);

    if (!endpoint) {
      const opened = window.open(fallbackHref, '_blank');
      if (opened) {
        opened.opener = null;
        setStatus({ kind: 'draft-opened' });
      } else {
        setStatus({ kind: 'error', message: 'Your browser blocked the new tab.', fallbackHref });
      }
      return;
    }

    setStatus({ kind: 'sending' });
    try {
      const data = new FormData(form);
      data.set('_subject', `Portfolio enquiry from ${values.name.trim()}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const payload: unknown = await response.json().catch(() => null);
      const ok =
        response.ok && typeof payload === 'object' && payload !== null && (payload as { ok?: unknown }).ok === true;
      if (!ok) throw new Error(`Form service responded with HTTP ${response.status}.`);
      form.reset();
      setStatus({ kind: 'sent' });
    } catch {
      setStatus({ kind: 'error', message: 'Your message could not be sent right now.', fallbackHref });
    }
  };

  const sending = status.kind === 'sending';

  if (status.kind === 'sent') {
    return (
      <div data-form-state="sent" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <output aria-live="polite" className="flex gap-3 text-emerald-900">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <span>
            <span className="block font-medium">Message sent. Thank you!</span>
            <span className="mt-1 block text-[0.9375rem] text-emerald-800">
              I&apos;ll reply to the email address you gave.
            </span>
          </span>
        </output>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-5 inline-flex min-h-11 items-center rounded-full border border-emerald-300 bg-surface px-5 text-[0.9375rem] font-medium text-emerald-900 transition-colors hover:bg-emerald-100"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-describedby={ids.note}
      data-form-mode={mode}
      data-form-state={status.kind}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={ids.name}
          name="name"
          label="Name"
          placeholder="Your name"
          autoComplete="name"
          maxLength={LIMITS.name}
          error={errors.name}
          disabled={sending}
        />
        <Field
          id={ids.email}
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={LIMITS.email}
          error={errors.email}
          disabled={sending}
        />
      </div>
      <Field
        id={ids.message}
        name="message"
        label="Message"
        placeholder="Tell me about your idea, project, or opportunity…"
        maxLength={LIMITS.message}
        error={errors.message}
        disabled={sending}
        multiline
      />

      {/* Spam trap: hidden from people, ignored by Formspree when filled by bots. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit"
        disabled={sending}
        className="group mt-1 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-fg text-base font-medium text-canvas shadow-[0_1px_2px_rgb(28_25_23/0.2),0_14px_30px_-14px_rgb(28_25_23/0.6)] transition-colors hover:bg-stone-800 disabled:cursor-wait disabled:opacity-80"
      >
        {sending ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-[1.05em] animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <ArrowUpRight
              aria-hidden="true"
              className="size-[1.05em] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </>
        )}
      </button>

      <p id={ids.note} className="text-[0.8125rem] leading-relaxed text-fg-subtle">
        {mode === 'formspree'
          ? 'Your message goes straight to my inbox. I reply to the email address you enter.'
          : 'This opens a pre-filled email in Gmail. Press Send there to deliver it.'}
      </p>

      <output aria-live="polite" data-form-status="" className="empty:hidden">
        {status.kind === 'draft-opened' ? (
          <span className="flex gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-[0.9375rem] text-blue-900">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>Gmail opened in a new tab with your message. Press Send there to deliver it.</span>
          </span>
        ) : status.kind === 'error' ? (
          <span className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-[0.9375rem] text-red-900">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              {status.message}{' '}
              <ExternalLink href={status.fallbackHref} className="font-medium underline underline-offset-4">
                Open the email in Gmail instead
              </ExternalLink>{' '}
              or write to {site.email}.
            </span>
          </span>
        ) : null}
      </output>
    </form>
  );
}

interface FieldProps {
  id: string;
  name: FieldName;
  label: string;
  placeholder: string;
  maxLength: number;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'email';
  autoComplete?: string;
  multiline?: boolean;
}

function Field({ id, name, label, placeholder, maxLength, error, disabled, type = 'text', autoComplete, multiline }: FieldProps) {
  const errorId = `${id}-error`;
  const control = cn(
    'block w-full rounded-xl border bg-surface px-4 text-base text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow]',
    'focus:border-accent focus:ring-4 focus:ring-accent/15 focus-visible:outline-none disabled:opacity-70',
    error ? 'border-red-400' : 'border-line-strong hover:border-fg/30',
  );
  const shared = {
    id,
    name,
    placeholder,
    maxLength,
    disabled,
    required: true,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  } as const;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={5} className={cn(control, 'min-h-36 resize-y py-3.5 leading-relaxed')} />
      ) : (
        <input {...shared} type={type} autoComplete={autoComplete} className={cn(control, 'h-14')} />
      )}
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
