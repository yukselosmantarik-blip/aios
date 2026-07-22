import Link from "next/link";

export default function Sidebar() {
  const linkClassName =
    "block rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50";

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-6 text-white">
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-zinc-50">
        AIOS
      </h1>

      <nav className="space-y-1">
        <Link href="/" className={linkClassName}>
          Dashboard
        </Link>
        <Link href="/projects" className={linkClassName}>
          Projekte
        </Link>
        <Link href="/customers" className={linkClassName}>
          Kunden
        </Link>
        <span className="block rounded-md px-3 py-2 text-sm text-zinc-500">
          KI-Agenten
        </span>
        <span className="block rounded-md px-3 py-2 text-sm text-zinc-500">
          Einstellungen
        </span>
      </nav>
    </aside>
  );
}
