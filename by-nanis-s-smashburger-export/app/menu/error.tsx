/**
 * GENERATED ROUTE ERROR — /menu
 */

'use client';

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RouteError({ reset }: RouteErrorProps) {
  return (
    <section className="pg-error pg-error--route" role="alert">
      <h2>Etwas ist schiefgelaufen</h2>
      <p>Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut.</p>
      <button type="button" onClick={() => reset()}>
        Erneut versuchen
      </button>
    </section>
  );
}
