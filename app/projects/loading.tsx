import Sidebar from "@/components/Sidebar";

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/80">
      {Array.from({ length: 8 }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-zinc-800" />
        </td>
      ))}
    </tr>
  );
}

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-72 animate-pulse rounded bg-zinc-800" />
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <th key={index} className="px-4 py-3">
                      <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
