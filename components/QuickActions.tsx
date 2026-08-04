import Link from "next/link";

const panelClassName =
  "rounded-xl border border-zinc-800 bg-zinc-900 p-6";

const actionClassName =
  "flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-left text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800/80";

const disabledActionClassName =
  "flex w-full cursor-not-allowed items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-4 py-3 text-left text-sm font-medium text-zinc-500";

const actions = [
  {
    label: "Neuer Kunde",
    href: "/customers",
    disabled: false,
  },
  {
    label: "Neues Projekt",
    href: "/projects",
    disabled: false,
  },
  {
    label: "Neue Website",
    href: "/website-wizard",
    disabled: false,
  },
  {
    label: "Neuer KI-Agent",
    href: null,
    disabled: true,
  },
  {
    label: "Neue Aufgabe",
    href: null,
    disabled: true,
  },
] as const;

export default function QuickActions() {
  return (
    <section className={panelClassName}>
      <h2 className="text-lg font-semibold text-zinc-50">Schnellaktionen</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Häufige Aktionen direkt vom Dashboard aus.
      </p>

      <div className="mt-5 grid gap-3">
        {actions.map((action) =>
          action.disabled || !action.href ? (
            <button
              key={action.label}
              type="button"
              disabled
              className={disabledActionClassName}
            >
              {action.label}
              <span className="ml-auto text-xs text-zinc-600">Demnächst</span>
            </button>
          ) : (
            <Link key={action.label} href={action.href} className={actionClassName}>
              {action.label}
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
