export default function AgentsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-50">
        Noch keine KI-Agenten vorhanden
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        Lege deinen ersten KI-Agenten an, um ihn hier in der Übersicht zu sehen.
      </p>
    </div>
  );
}
