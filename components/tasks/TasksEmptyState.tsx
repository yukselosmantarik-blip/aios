type TasksEmptyStateProps = {
  filtered?: boolean;
  hasProjects?: boolean;
};

export default function TasksEmptyState({
  filtered = false,
  hasProjects = true,
}: TasksEmptyStateProps) {
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
            d="M9 11l3 3L22 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-50">
        {filtered
          ? "Keine Aufgaben für dieses Projekt"
          : "Noch keine Aufgaben vorhanden"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {filtered
          ? "Wähle ein anderes Projekt oder zeige alle Aufgaben an."
          : hasProjects
            ? "Sobald Aufgaben angelegt werden, erscheinen sie hier in der Übersicht."
            : "Lege zuerst ein Projekt an, bevor du Aufgaben verwalten kannst."}
      </p>
    </div>
  );
}
