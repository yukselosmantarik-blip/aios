/**
 * GENERATED COMPONENT — ContactForm
 * Sprint 8.3 — premium visual component library
 */

'use client';


import { cn, variants } from '@/styles/tailwind-mapping';
import { useState } from 'react';
import { Placeholder } from './Placeholder';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

type ContactFormProps = {
  className?: string;
};

export function ContactForm({ className }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle');

  return (
    <form
      className={cn('space-y-[var(--spacing-md)]', className)}
      noValidate
      aria-label="ContactForm"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus('loading');
        window.setTimeout(() => setStatus('success'), 600);
      }}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-[var(--font-weight-medium)]">Name *</label>
        <input id="name" name="name" type="text" placeholder="Max Mustermann" className={variants.input} required disabled={status === 'loading'} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-[var(--font-weight-medium)]">E-Mail *</label>
        <input id="email" name="email" type="email" placeholder="ihre@email.de" className={variants.input} required disabled={status === 'loading'} />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-[var(--font-weight-medium)]">Nachricht *</label>
        <textarea id="message" name="message" placeholder="Wie können wir helfen?" className={variants.input} rows={4} required disabled={status === 'loading'} />
      </div>
      <label className="flex items-start gap-[var(--spacing-sm)] text-sm">
        <input type="checkbox" required disabled={status === 'loading'} />
        <Placeholder label="[PLACEHOLDER: Datenschutz-Link]" category="legal" />
      </label>
      {status === 'loading' ? (
        <Placeholder label="[PLACEHOLDER: Loading]" category="other" />
      ) : null}
      {status === 'success' ? (
        <Placeholder label="Vielen Dank — wir melden uns [PLACEHOLDER: timeframe]." category="other" />
      ) : null}
      {status === 'error' ? (
        <Placeholder label="[PLACEHOLDER: Error message]" category="other" launchBlocking />
      ) : null}
      <button
        type="submit"
        className={cn(variants.buttonPrimary, variants.motionSafe, 'min-h-11')}
        disabled={status === 'loading'}
        aria-busy={status === 'loading'}
      >
        Vielen Dank — wir melden uns [PLACEHOLDER: timeframe].
      </button>
    </form>
  );
}
