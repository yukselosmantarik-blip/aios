import Sidebar from "@/components/Sidebar";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-800" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex justify-between gap-4">
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-zinc-800 pt-4">
        <div className="h-3 w-28 animate-pulse rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export default function AgentsLoading() {
  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="h-8 w-36 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-zinc-800" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-800" />
              <div className="h-8 w-24 animate-pulse rounded-md bg-zinc-800" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
