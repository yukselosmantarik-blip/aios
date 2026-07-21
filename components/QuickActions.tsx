const actions = [
    "+ Neuer Kunde",
    "+ Neues Projekt",
    "+ Neue Website",
    "+ Neuer KI-Agent",
  ];
  
  export default function QuickActions() {
    return (
      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Schnellaktionen</h2>
  
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action}
              className="rounded-lg border border-gray-200 px-4 py-3 text-left font-medium hover:bg-gray-50"
            >
              {action}
            </button>
          ))}
        </div>
      </section>
    );
  }