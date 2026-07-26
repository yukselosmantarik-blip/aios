/**
 * GENERATED ROOT ERROR BOUNDARY — Sprint 8.2B
 */

'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <section className="pg-error" role="alert">
      <h1>Etwas ist schiefgelaufen</h1>
      <p>Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut.</p>
      <button type="button" onClick={() => reset()}>
        Erneut versuchen
      </button>
    </section>
  );
}
