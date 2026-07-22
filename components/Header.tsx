import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.email?.split("@")[0] ?? "Nutzer";

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Willkommen zurück, {displayName}. Hier ist dein Überblick.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <span className="hidden rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-400 sm:inline">
          {user?.email}
        </span>
        <div className="[&_button]:text-zinc-400 [&_button]:hover:text-zinc-200">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
