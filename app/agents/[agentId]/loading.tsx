import Sidebar from "@/components/Sidebar";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800 ${className ?? ""}`} />;
}

export default function AgentDetailLoading() {
  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <SkeletonBlock className="mb-6 h-4 w-28" />
          <div className="mb-8 space-y-3">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-96 max-w-full" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <SkeletonBlock className="mb-4 h-6 w-40" />
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-5/6" />
                  <SkeletonBlock className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
