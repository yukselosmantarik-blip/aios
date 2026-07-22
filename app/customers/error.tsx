"use client";

import Sidebar from "@/components/Sidebar";

type CustomersErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CustomersError({ error, reset }: CustomersErrorProps) {
  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center px-4 py-24 md:px-6 lg:px-12">
          <div className="w-full max-w-md rounded-xl border border-red-900/50 bg-red-950/20 px-6 py-8 text-center">
            <h1 className="text-lg font-semibold text-zinc-50">
              Kunden konnten nicht geladen werden
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Beim Abrufen der Kundendaten ist ein Fehler aufgetreten. Bitte
              versuche es erneut.
            </p>
            {error.message ? (
              <p className="mt-4 rounded-md bg-zinc-900 px-3 py-2 text-left text-xs text-red-400">
                {error.message}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
