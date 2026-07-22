type ProjectsEmptyStateProps = {
  hasCustomers?: boolean;
};

export default function ProjectsEmptyState({
  hasCustomers = true,
}: ProjectsEmptyStateProps) {
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
            d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-50">
        Noch keine Projekte vorhanden
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {hasCustomers
          ? "Lege dein erstes Projekt an, um Kundenarbeit zu organisieren."
          : "Lege zuerst einen Kunden an, bevor du ein Projekt erstellen kannst."}
      </p>
    </div>
  );
}
