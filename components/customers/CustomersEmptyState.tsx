type CustomersEmptyStateProps = {
  count?: number;
};

export default function CustomersEmptyState({
  count = 0,
}: CustomersEmptyStateProps) {
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
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-50">
        Noch keine Kunden vorhanden
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {count === 0
          ? "Sobald Kunden angelegt werden, erscheinen sie hier in der Übersicht."
          : "Keine Kunden entsprechen den aktuellen Filtern."}
      </p>
    </div>
  );
}
