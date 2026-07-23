"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/projects", label: "Projekte" },
  { href: "/customers", label: "Kunden" },
  { href: "/tasks", label: "Aufgaben" },
  { href: "/agents", label: "AI Agents" },
] as const;

function isActive(pathname: string, href: string, exact = false): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-6 text-white">
      <h1 className="mb-10 text-2xl font-bold tracking-tight text-zinc-50">
        AIOS
      </h1>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, "exact" in item && item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-800 font-medium text-zinc-50"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <span className="block rounded-md px-3 py-2 text-sm text-zinc-500">
          Einstellungen
        </span>
      </nav>
    </aside>
  );
}
